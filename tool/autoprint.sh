#!/bin/bash

WINDOW_NAME="Cisco Packet Tracer"

xdotool search --name "$WINDOW_NAME" windowactivate

sleep 2
xdotool key "Alt+f"  # Example: open File menu
xdotool key "p"      # Example: press Print option
sleep 1
xdotool key Return
