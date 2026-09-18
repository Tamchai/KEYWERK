package infrastructure

import (
	"errors"
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

func InitConfig() error {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("../")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	viper.SetDefault("app.env", "dev")
	viper.SetDefault("app.port", 8080)
	viper.SetDefault("app.cors.allow_origins", "http://localhost:5173")
	viper.SetDefault("app.frontend_url", "http://localhost:5173")
	viper.SetDefault("system.timezone", "Asia/Bangkok")
	viper.SetDefault("database.neon.port", 5432)
	viper.SetDefault("database.neon.sslmode", "require")
	viper.SetDefault("database.neon.channel_binding", "require")
	viper.SetDefault("database.neon.timezone", "Asia/Bangkok")
	viper.SetDefault("database.neon.connect_timeout_seconds", 10)
	viper.SetDefault("database.neon.statement_timeout_milliseconds", 10000)
	viper.SetDefault("database.neon.max_open_connections", 10)
	viper.SetDefault("database.neon.max_idle_connections", 5)
	viper.SetDefault("seaweedfs.timeout_seconds", 30)
	viper.SetDefault("seaweedfs.url", "http://localhost:8333")
	viper.SetDefault("seaweedfs.region", "us-east-1")
	viper.SetDefault("seaweedfs.bucket", "products")
	viper.SetDefault("seaweedfs.profile_bucket", "profiles")
	viper.SetDefault("dev_admin.enabled", true)
	viper.SetDefault("dev_admin.email", "admin@gmail.com")
	viper.SetDefault("dev_admin.password", "1234")
	viper.SetDefault("stripe.enabled", false)

	if err := viper.ReadInConfig(); err != nil {
		var notFound viper.ConfigFileNotFoundError
		if !errors.As(err, &notFound) {
			return err
		}
	}

	required := []string{"app.secret", "database.neon.host", "database.neon.user", "database.neon.password", "database.neon.name"}
	for _, key := range required {
		if strings.TrimSpace(viper.GetString(key)) == "" {
			return fmt.Errorf("required configuration %q is missing", key)
		}
	}
	if viper.GetBool("stripe.enabled") {
		secretKey := strings.TrimSpace(viper.GetString("stripe.secret_key"))
		webhookSecret := strings.TrimSpace(viper.GetString("stripe.webhook_secret"))
		if !strings.HasPrefix(secretKey, "sk_test_") {
			return errors.New("stripe.secret_key must be a Stripe test-mode secret key (sk_test_...)")
		}
		if !strings.HasPrefix(webhookSecret, "whsec_") {
			return errors.New("stripe.webhook_secret must be a Stripe webhook signing secret (whsec_...)")
		}
	}
	return nil
}
