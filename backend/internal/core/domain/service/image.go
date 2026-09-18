package service

import (
	"context"
	"fmt"
	"net/url"
	"time"

	"github.com/google/uuid"
	"github.com/keywerk/internal/core/domain/dto"
	"github.com/keywerk/internal/core/domain/errs"
	port "github.com/keywerk/internal/core/port/repository"
)

type ImageService interface {
	// UploadImage(ctx context.Context, fileHeaderName string, file io.Reader, contentType string) (*dto.ResImage, error)
	UploadImage(ctx context.Context, imageLists []dto.ReqImageData) (*[]dto.ResImage, error)
}

type imageService struct {
	imageRepo port.ImageRepository
}

func NewImageService(imageRepo port.ImageRepository) ImageService {
	return &imageService{imageRepo}
}

func (s *imageService) UploadImage(ctx context.Context, imageLists []dto.ReqImageData) (*[]dto.ResImage, error) {
	resImageList := make([]dto.ResImage, 0, len(imageLists))
	type uploadedImage struct{ id, key string }
	uploaded := make([]uploadedImage, 0, len(imageLists))
	rollback := func() {
		rollbackCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		for i := len(uploaded) - 1; i >= 0; i-- {
			_ = s.imageRepo.DeleteImage(rollbackCtx, uploaded[i].id, uploaded[i].key)
		}
	}

	for i := range imageLists {
		newImageID := uuid.NewString()
		extensions := map[string]string{"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
		ext, ok := extensions[imageLists[i].ContentType]
		if !ok {
			rollback()
			return nil, errs.BadRequest("unsupported image type", nil)
		}

		fileName := fmt.Sprintf("%s%s", newImageID, ext)

		imageData := dto.ReqImageData{
			FileName:    fileName,
			File:        imageLists[i].File,
			ContentType: imageLists[i].ContentType,
		}

		imageURL, err := s.imageRepo.UploadToSeaweed(ctx, imageData)

		if err != nil {
			rollback()
			return nil, errs.Internal("cannot upload image", err)
		}
		uploaded = append(uploaded, uploadedImage{id: newImageID, key: fileName})

		url, err := url.Parse(imageURL)

		if err != nil {
			rollback()
			return nil, errs.Internal("cannot parse image URL", err)
		}

		image := dto.Image{
			ID:        newImageID,
			URL:       url.Path,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		err = s.imageRepo.SaveImageMetadata(ctx, image)
		if err != nil {
			rollback()
			return nil, errs.Internal("cannot save image metadata", err)
		}

		resImageList = append(resImageList, dto.ResImage{
			ID:  newImageID,
			URL: image.URL,
		})
	}

	return &resImageList, nil
}
