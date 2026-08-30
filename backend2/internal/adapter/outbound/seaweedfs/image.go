package seaweedfs

import (
	"context"
	"errors"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/jmoiron/sqlx"
	"github.com/keywerk/internal/core/domain/dto"
	port "github.com/keywerk/internal/core/port/repository"
	"github.com/spf13/viper"
)

type imageRepository struct {
	s3Client   *s3.Client
	bucketName string
	db         *sqlx.DB
}

func NewImageRepository(s3Client *s3.Client, bucketName string, db *sqlx.DB) port.ImageRepository {
	return &imageRepository{
		s3Client:   s3Client,
		bucketName: bucketName,
		db:         db,
	}
}

func (r *imageRepository) UploadToSeaweed(ctx context.Context, imageData dto.ReqImageData) (string, error) {

	_, err := r.s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(r.bucketName),       // "products"
		Key:         aws.String(imageData.FileName), // e.g. "a5d8f9e1.jpg"
		Body:        imageData.File,
		ContentType: aws.String(imageData.ContentType),
	})

	if err != nil {
		return "", fmt.Errorf("failed to upload file to seaweedfs: %w", err)
	}

	// สร้าง URL สำหรับดึงรูปกลับมาแสดงผล (ใช้พอร์ต 8888 Filer หรือ 8333 S3 ก็ได้)
	imageURL := fmt.Sprintf("%s/%s/%s", viper.GetString("seaweedfs.url"), r.bucketName, imageData.FileName)
	return imageURL, nil
}

func (r *imageRepository) SaveImageMetadata(ctx context.Context, image dto.Image) error {
	query := `INSERT INTO images (image_id, image_url, created_at, updated_at) VALUES ($1, $2, $3, $4)`

	result, err := r.db.ExecContext(ctx, query, image.ID, image.URL, image.CreatedAt, image.UpdatedAt)

	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()

	if err != nil {
		return err
	}

	if affected <= 0 {
		return errors.New("can't save image")
	}

	return nil
}

// func (r *imageRepository) RemoveImage(ctx context.Context, imageData dto.ReqImageData) error {

// 	r.s3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
// 		Bucket: &r.bucketName,
// 		Key:    &imageData.FileName,
// 	})

// 	return nil
// }
