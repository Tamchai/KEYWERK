package s3

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func NewS3Client(endpoint, accessKey, secretKey, region string) (*s3.Client, error) {
	// 1. โหลด Config พื้นฐาน (ใส่ Region กับ Credentials)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %v", err)
	}

	// 2. ตั้งค่า BaseEndpoint และ UsePathStyle ใน s3.NewFromConfig ตรงๆ
	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint) // 👈 ชี้ไปที่ "http://localhost:8333" ได้เลย
		o.UsePathStyle = true                 // ⚠️ จำเป็นสำหรับ SeaweedFS / MinIO
	})

	return client, nil
}

func EnsureBucket(client *s3.Client, bucket string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if _, err := client.HeadBucket(ctx, &s3.HeadBucketInput{Bucket: aws.String(bucket)}); err == nil {
		return nil
	}
	if _, err := client.CreateBucket(ctx, &s3.CreateBucketInput{Bucket: aws.String(bucket)}); err != nil {
		return fmt.Errorf("ensure bucket %q: %w", bucket, err)
	}
	return nil
}
