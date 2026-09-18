package stripe

import (
	"context"
	"encoding/json"
	"fmt"

	stripeapi "github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/webhook"

	"github.com/keywerk/internal/core/port/gateway"
)

type paymentGateway struct {
	client        *stripeapi.Client
	webhookSecret string
}

func NewPaymentGateway(secretKey, webhookSecret string) gateway.PaymentGateway {
	return &paymentGateway{
		client:        stripeapi.NewClient(secretKey),
		webhookSecret: webhookSecret,
	}
}

func (g *paymentGateway) CreateCheckoutSession(ctx context.Context, req gateway.CheckoutRequest) (*gateway.CheckoutSession, error) {
	params := &stripeapi.CheckoutSessionCreateParams{
		Mode:              stripeapi.String(string(stripeapi.CheckoutSessionModePayment)),
		SuccessURL:        stripeapi.String(req.SuccessURL),
		CancelURL:         stripeapi.String(req.CancelURL),
		ClientReferenceID: stripeapi.String(req.OrderID),
		LineItems: []*stripeapi.CheckoutSessionCreateLineItemParams{{
			Quantity: stripeapi.Int64(1),
			PriceData: &stripeapi.CheckoutSessionCreateLineItemPriceDataParams{
				Currency:   stripeapi.String(req.Currency),
				UnitAmount: stripeapi.Int64(req.Amount),
				ProductData: &stripeapi.CheckoutSessionCreateLineItemPriceDataProductDataParams{
					Name: stripeapi.String(req.Name),
				},
			},
		}},
		Metadata: map[string]string{
			"payment_id": req.PaymentID,
			"order_id":   req.OrderID,
		},
	}
	params.IdempotencyKey = stripeapi.String(fmt.Sprintf("checkout-%s-%d", req.PaymentID, req.Attempt))

	created, err := g.client.V1CheckoutSessions.Create(ctx, params)
	if err != nil {
		return nil, err
	}
	if created.ID == "" || created.URL == "" {
		return nil, fmt.Errorf("stripe returned an incomplete checkout session")
	}
	return &gateway.CheckoutSession{ID: created.ID, URL: created.URL}, nil
}

func (g *paymentGateway) ParseWebhook(payload []byte, signature string) (*gateway.WebhookEvent, error) {
	// Stripe accounts and webhook endpoints can be upgraded independently of
	// stripe-go. We only decode stable Checkout Session fields below, so accept
	// a newer event schema while retaining signature and timestamp validation.
	event, err := webhook.ConstructEventWithOptions(payload, signature, g.webhookSecret, webhook.ConstructEventOptions{
		IgnoreAPIVersionMismatch: true,
	})
	if err != nil {
		return nil, err
	}

	var checkout stripeapi.CheckoutSession
	if err := json.Unmarshal(event.Data.Raw, &checkout); err != nil {
		return nil, fmt.Errorf("decode Stripe Checkout Session: %w", err)
	}

	paymentIntentID := ""
	if checkout.PaymentIntent != nil {
		paymentIntentID = checkout.PaymentIntent.ID
	}

	return &gateway.WebhookEvent{
		ID:              event.ID,
		Type:            string(event.Type),
		PaymentID:       checkout.Metadata["payment_id"],
		OrderID:         checkout.Metadata["order_id"],
		SessionID:       checkout.ID,
		PaymentIntentID: paymentIntentID,
		PaymentStatus:   string(checkout.PaymentStatus),
	}, nil
}
