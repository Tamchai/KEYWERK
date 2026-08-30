package infrastructure

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/spf13/viper"
)

var DB *sqlx.DB

func InitNeon() {

	host := viper.GetString("database.neon.host")
	user := viper.GetString("database.neon.user")
	password := viper.GetString("database.neon.password")
	name := viper.GetString("database.neon.name")
	port := viper.GetInt("database.neon.port")
	sslmode := viper.GetString("database.neon.sslmode")
	timezone := viper.GetString("database.neon.timezone")
	channelBinding := viper.GetString("database.neon.channel_binding")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s channel_binding=%s TimeZone=%s", host, user, password, name, port, sslmode, channelBinding, timezone)

	db, err := sqlx.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}

	DB = db
}
