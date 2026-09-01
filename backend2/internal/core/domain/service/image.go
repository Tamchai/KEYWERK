package service

import (
	"context"
	"fmt"
	"net/url"
	"path/filepath"
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

	for i := range imageLists {

		newImageID := uuid.NewString()

		ext := filepath.Ext(imageLists[i].FileName)

		fileName := fmt.Sprintf("%s%s", newImageID, ext)

		imageData := dto.ReqImageData{
			FileName:    fileName,
			File:        imageLists[i].File,
			ContentType: imageLists[i].ContentType,
		}

		imageURL, err := s.imageRepo.UploadToSeaweed(ctx, imageData)

		if err != nil {
			return nil, err
		}

		url, err := url.Parse(imageURL)

		if err != nil {
			return nil, errs.Internal("can't parse file path", err)
		}

		image := dto.Image{
			ID:        newImageID,
			URL:       url.Path,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		err = s.imageRepo.SaveImageMetadata(ctx, image)
		if err != nil {
			return nil, err
		}

		resImageList = append(resImageList, dto.ResImage{
			ID:  newImageID,
			URL: imageURL,
		})
	}

	return &resImageList, nil
}

func (s *imageService) RemovImage(ctx context.Context) {

}
