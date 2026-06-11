# Översättningsplan: Resebrev

## Översikt

Denna plan styr den rena svenska publikversionen av `Resebrev`.

**Källa**: `stories/resebrev/chapters/` — rått kapitelmanus baserat på resebreven från 2003-2004.  
**Svensk version**: `stories/resebrev/translations/svenska/kapitel/`  
**Status**: Första svenska arbetsversion införd från korrigerade kapitel. Nästa pass ska översätta kvarvarande engelska repliker och längre engelska partier så att versionen blir helsvensk.

## Grundbeslut

`Resebrev` ska finnas i tre olika publikspår:

1. **Original/mix**: den historiska resebrevsrösten med svenska, engelska, kodväxling och tidslager bevarade.
2. **Ren svensk version**: en svensk publikversion utan engelsk-svensk blandprosa.
3. **Ren engelsk version**: en separat engelsk publikversion för annan publik.

Den här katalogen är spår 2: ren svensk version. Den ska därför inte bevara engelska av nostalgiska eller dokumentära skäl. Engelska får bara finnas kvar som egennamn, verkstitlar, etablerade plats-/institutionsnamn eller mycket korta uttryck där själva låneordet är normal svensk prosa.

Eftersom källmaterialet redan till stor del är svensk prosa ska den svenska versionen behandlas som ett publiceringslager där:

1. svensk råprosa rättas och stabiliseras,
2. engelska repliker översätts till idiomatisk svenska,
3. längre engelska råbrevspartier översätts som svensk resebrevsprosa,
4. språkförbistring återges i svensk prosa utan att blandningen svenska/engelska blir bärande,
5. redaktionella ingrepp synliggör vad som är 2003-röst och vad som är 2026-bearbetning.

## Röstkompass

### Bevara

- den unga berättarens snabbhet, självironi och ibland osnygga omdöme,
- den muntliga resebrevsrytmen,
- de plötsliga växlingarna mellan observation, skämt, skam och moralisk klarhet,
- blandningen av vardagligt snack och allvar när den fungerar, men inom ett svenskt språkflöde.

### Undvik

- att göra berättaren klokare än han är i materialet,
- att putsa bort tidsmarkörer som visar 2003,
- att ersätta rå energi med prydlig essäprosa,
- att göra språkförbistringen för prydlig; den ska kännas, men på svenska.

## Dialogprinciper

| Situation | Ren svensk version |
|---|---|
| Engelska som verkligt samtal mellan resenärer | Översätt till svenska, men låt sammanhanget visa att de talar engelska |
| Engelska som bara råbrevets skrivspråk | Översätt till svensk resebrevsprosa |
| Språkförbistring, trasig engelska, pidgin | Återge friktionen på svenska, utan karikatyr |
| Skyltar, slogans och menyer | Översätt i löptext eller med svensk förklaring |
| Längre engelska reflexionspartier | Översätt helt |

## Nästa Översättningspass

1. Gå kapitel för kapitel och markera all kvarvarande engelska.
2. Översätt dialog, skyltar, råbrevspartier och reflektioner till svenska.
3. Behåll bara egennamn, låneord och titlar som fungerar i svensk text.
4. Läs hela svenska versionen högt för rytm och idiom.
5. Bygg om `compiled/resebrev-svenska.md` och PDF.

## Kvalitetskontroll

- Inga gamla tangentbordsformer: `aa`, `ae`, `oe`, `foer`, `saa`, `paa`.
- Platsnamn konsekventa: `Srinagar`, `Phnom Penh`, `Kathmandu`, `Rajasthan`, `Kashmir`.
- Svenska kapitelrubriker i `kapitel_*.md`.
- Inga längre engelska repliker eller engelska prosastycken ska finnas kvar i den svenska versionen.
- Tonen ska fortfarande kännas som resebrev, inte som en efterhandsessä.
