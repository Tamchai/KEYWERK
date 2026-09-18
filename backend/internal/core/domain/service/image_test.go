package service

import (
	"context"
	"strings"
	"testing"

	"github.com/keywerk/internal/core/domain/dto"
)

type imageRepositoryStub struct {
	saved dto.Image
}

func (r *imageRepositoryStub) UploadToSeaweed(context.Context, dto.ReqImageData) (string, error) {
	return "http://localhost:8333/products/generated.png", nil
}

func (r *imageRepositoryStub) SaveImageMetadata(_ context.Context, image dto.Image) error {
	r.saved = image
	return nil
}

func (r *imageRepositoryStub) DeleteImage(context.Context, string, string) error { return nil }

func TestUploadImageReturnsPublicResolvablePath(t *testing.T) {
	repo := &imageRepositoryStub{}
	service := NewImageService(repo)

	images, err := service.UploadImage(context.Background(), []dto.ReqImageData{{
		FileName: "source.png", File: strings.NewReader("image"), ContentType: "image/png",
	}})
	if err != nil {
		t.Fatalf("UploadImage() error = %v", err)
	}
	if len(*images) != 1 {
		t.Fatalf("UploadImage() count = %d, want 1", len(*images))
	}
	if got, want := (*images)[0].URL, repo.saved.URL; got != want {
		t.Fatalf("response image URL = %q, want stored public path %q", got, want)
	}
	if got, want := repo.saved.URL, "/products/generated.png"; got != want {
		t.Fatalf("stored image URL = %q, want %q", got, want)
	}
}
