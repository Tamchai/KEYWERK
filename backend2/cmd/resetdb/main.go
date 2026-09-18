package main

import (
	"flag"
	"fmt"
	"log"
	"strings"

	"github.com/keywerk/internal/infrastructure"
	"github.com/spf13/viper"
)

func main() {
	confirm := flag.Bool("confirm-reset", false, "ยืนยันการล้างฐานข้อมูล development")
	flag.Parse()

	if !*confirm {
		log.Fatal("refusing to reset: pass --confirm-reset")
	}
	if err := infrastructure.InitConfig(); err != nil {
		log.Fatalf("load config: %v", err)
	}
	if !strings.EqualFold(viper.GetString("app.env"), "dev") {
		log.Fatal("refusing to reset: app.env must be dev")
	}

	databaseName := viper.GetString("database.neon.name")
	fmt.Printf("Resetting development database %q...\n", databaseName)
	db, err := infrastructure.OpenConfiguredDatabase()
	if err != nil {
		log.Fatal(err)
	}
	if _, err = db.Exec(`DROP SCHEMA public CASCADE; CREATE SCHEMA public`); err != nil {
		_ = db.Close()
		log.Fatalf("reset schema: %v", err)
	}
	_ = db.Close()

	if err = infrastructure.InitNeon(); err != nil {
		log.Fatalf("rebuild schema: %v", err)
	}
	_ = infrastructure.DB.Close()
	fmt.Println("Reset complete; development admin was seeded.")
}
