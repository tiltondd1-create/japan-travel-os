# Testing Guide

## RC2 Smoke Test

1. Open `/api?action=core`
2. Open `/fx`
3. Open app with `?reset=1`
4. Open normally
5. Install on iPhone via Safari → Share → Add to Home Screen

## Offline Test

1. Open the app while online.
2. Visit Today, Hilda, Lost, SOS, Phrases, Suica, Money.
3. Turn on Airplane Mode.
4. Relaunch app.
5. Confirm essential info still appears.

## Family Test Script

Ask each person to do realistic tasks:

### Hilda
- Find today’s plan.
- Find hotel info.
- Open Lost Mode.
- Open SOS.
- Find bathroom guide.

### Nick
- Find food.
- Find shopping.
- Find transit.
- Find phrases.

### David + Noelle
- Check reservations.
- Check maps.
- Check budget.
- Check Money Hub.
- Check packing.

## Pass Criteria

Travel OS 1.0 is ready when:
- Everyone can find what they need without explanation.
- Offline mode works for essentials.
- Hotel, maps, emergency, Suica, and money info are complete.
- No major bugs found in practice testing.
