#!/bin/bash
# Arka plan servisini durdurur
launchctl bootout "gui/$(id -u)/com.ayisigi.kutuphane" 2>/dev/null || true
launchctl bootout "gui/$(id -u)/com.ayisigi.tunnel" 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
echo "Site ve tünel durduruldu."
