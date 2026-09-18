package stripe

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"testing"
	"time"
)

func TestParseWebhookAcceptsNewerAPIVersion(t *testing.T) {
	const secret = "whsec_test"
	payload := []byte(`{
		"id":"evt_test",
		"object":"event",
		"api_version":"2099-01-01.future",
		"type":"checkout.session.completed",
		"data":{"object":{
			"id":"cs_test",
			"object":"checkout.session",
			"payment_status":"paid",
			"payment_intent":"pi_test",
			"metadata":{"payment_id":"payment_test","order_id":"order_test"}
		}}
	}`)
	signature := signWebhookPayload(payload, secret, time.Now().Unix())

	event, err := NewPaymentGateway("sk_test_placeholder", secret).ParseWebhook(payload, signature)
	if err != nil {
		t.Fatalf("ParseWebhook() error = %v", err)
	}
	if event.ID != "evt_test" || event.SessionID != "cs_test" || event.PaymentIntentID != "pi_test" {
		t.Fatalf("ParseWebhook() returned unexpected event: %#v", event)
	}
	if event.PaymentID != "payment_test" || event.OrderID != "order_test" || event.PaymentStatus != "paid" {
		t.Fatalf("ParseWebhook() returned unexpected checkout metadata: %#v", event)
	}
}

func TestParseWebhookStillRejectsInvalidSignature(t *testing.T) {
	_, err := NewPaymentGateway("sk_test_placeholder", "whsec_test").ParseWebhook(
		[]byte(`{"id":"evt_test","object":"event"}`),
		"t=1,v1=invalid",
	)
	if err == nil {
		t.Fatal("ParseWebhook() expected signature validation error")
	}
}

func signWebhookPayload(payload []byte, secret string, timestamp int64) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = fmt.Fprintf(mac, "%d.%s", timestamp, payload)
	return fmt.Sprintf("t=%d,v1=%s", timestamp, hex.EncodeToString(mac.Sum(nil)))
}
