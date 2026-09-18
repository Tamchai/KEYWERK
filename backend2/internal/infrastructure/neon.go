package infrastructure

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/spf13/viper"
	"golang.org/x/crypto/bcrypt"
)

var DB *sqlx.DB

func InitNeon() error {
	db, err := OpenConfiguredDatabase()
	if err != nil {
		return err
	}

	if err := RunMigrations(db); err != nil {
		_ = db.Close()
		return fmt.Errorf("migrate database: %w", err)
	}
	log.Println("Database schema is up to date")

	if err := seedDevelopmentAdmin(db); err != nil {
		_ = db.Close()
		return fmt.Errorf("seed development admin: %w", err)
	}

	DB = db
	return nil
}

func CloseNeon() error {
	if DB == nil {
		return nil
	}
	return DB.Close()
}

func OpenConfiguredDatabase() (*sqlx.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=%s channel_binding=%s TimeZone=%s connect_timeout=%d statement_timeout=%d",
		viper.GetString("database.neon.host"),
		viper.GetString("database.neon.user"),
		viper.GetString("database.neon.password"),
		viper.GetString("database.neon.name"),
		viper.GetInt("database.neon.port"),
		viper.GetString("database.neon.sslmode"),
		viper.GetString("database.neon.channel_binding"),
		viper.GetString("database.neon.timezone"),
		viper.GetInt("database.neon.connect_timeout_seconds"),
		viper.GetInt("database.neon.statement_timeout_milliseconds"),
	)

	db, err := sqlx.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	db.SetMaxOpenConns(viper.GetInt("database.neon.max_open_connections"))
	db.SetMaxIdleConns(viper.GetInt("database.neon.max_idle_connections"))
	db.SetConnMaxLifetime(30 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(viper.GetInt("database.neon.connect_timeout_seconds"))*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}
	log.Println("Connected to PostgreSQL successfully")
	return db, nil
}

func seedDevelopmentAdmin(db *sqlx.DB) error {
	if !strings.EqualFold(viper.GetString("app.env"), "dev") || !viper.GetBool("dev_admin.enabled") {
		return nil
	}

	email := strings.ToLower(strings.TrimSpace(viper.GetString("dev_admin.email")))
	password := viper.GetString("dev_admin.password")
	if email == "" || password == "" {
		return fmt.Errorf("dev_admin.email and dev_admin.password are required when dev admin seeding is enabled")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash admin password: %w", err)
	}

	_, err = db.Exec(`
		INSERT INTO users (user_id, name, email, password, role, created_at, updated_at)
		VALUES ($1, 'KEYWERK Admin', $2, $3, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT (email) DO UPDATE
		SET role = 'admin', password = EXCLUDED.password, updated_at = CURRENT_TIMESTAMP`,
		uuid.NewString(), email, string(hash))
	if err != nil {
		return fmt.Errorf("upsert development admin: %w", err)
	}

	return nil
}
