# QA Checklist

## After every deployment

- [ ] `/api?action=core` returns JSON with `ok:true`
- [ ] `/fx` returns JSON with a JPY rate
- [ ] App opens with `?reset=1`
- [ ] App opens normally afterward
- [ ] Money tab works
- [ ] Apple Wallet Suica page works
- [ ] Hilda tab works
- [ ] Nick tab works
- [ ] D+N tab works
- [ ] SOS works
- [ ] Lost Mode works
- [ ] Search works

## iPhone testing

- [ ] Install on David’s iPhone
- [ ] Install on Noelle’s iPhone
- [ ] Install on Nick’s iPhone
- [ ] Install on Hilda’s iPhone
- [ ] Launches as standalone PWA
- [ ] Bottom nav is usable
- [ ] Text is readable
- [ ] Tap targets are comfortable

## Offline test

1. Open app online.
2. Visit Today, Hilda, Lost, SOS, Phrases, Suica, Money.
3. Turn on Airplane Mode.
4. Fully close and reopen the app.
5. Confirm essential info still appears.

## Family test

Ask each person: “Where did you get stuck?”

Turn each answer into a GitHub issue or sheet note.
