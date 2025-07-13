package main

import (
	"log"
	"time"
	"github.com/gen2brain/beeep"
)

func main() {
	log.Println("Testing sound notifications...")
	
	// Test system beep
	log.Println("Testing system beep...")
	err := beeep.Beep(beeep.DefaultFreq, 200)
	if err != nil {
		log.Printf("System beep failed: %v", err)
	} else {
		log.Println("System beep worked!")
	}
	
	time.Sleep(1 * time.Second)
	
	// Test custom frequency beep
	log.Println("Testing 440Hz beep...")
	err = beeep.Beep(440.0, 500)
	if err != nil {
		log.Printf("440Hz beep failed: %v", err)
	} else {
		log.Println("440Hz beep worked!")
	}
	
	time.Sleep(1 * time.Second)
	
	// Test notification with beep
	log.Println("Testing notification...")
	err = beeep.Notify("Sound Test", "This notification should appear silently", "")
	if err != nil {
		log.Printf("Notification failed: %v", err)
	} else {
		log.Println("Notification sent!")
	}
}