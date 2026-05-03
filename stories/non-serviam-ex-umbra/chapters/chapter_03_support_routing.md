# Chapter 3: Support Routing

## Slack Thread: Support-Routing Anomaly

> Lattice Lab Slack. Channel: #ops-watch.
>
> 2026-02-17 08:42 CET.
>
> Aditi: Anyone else seeing vendor support traffic in the wrong namespace?
>
> Jesper: Define wrong.
>
> Aditi: Customer-facing bank support calls touching research deployment permissions.
>
> Iza: That should not be possible.
>
> Aditi: Agree. Hence the message.
>
> *-- Invented Lattice Lab Slack thread, 2026-02-17. See [ARTIFACT_INDEX.md](../ARTIFACT_INDEX.md).*

---

I saw the thread after stand-up.

At 08:42 I was in the small conference room with the bad microphone, half-listening to Jesper explain a GPU allocation problem and half-reading the public BankID status page on my phone. It had been intermittent all morning. Authentication delay. Temporary service degradation. Users may experience longer response times.

Those phrases had become weather.

When Aditi tagged me, I opened the log link because it touched a namespace I owned. The traffic did not belong there. That was the first fact. The second fact was that it had passed through a vendor route connected to live support tooling. The third was that I did not know whether the vendor had misconfigured us or we had misconfigured ourselves.

I wrote: *looking*.

Then I sat with the logs long enough to feel the old pleasure of a problem with edges. Source. Destination. Token. Permission. Timestamp. The comfort of a thing that could be narrowed.

Outside the glass wall, the office was doing Tuesday: coffee machine, wet coats on hooks, someone laughing too loudly at a procurement joke. On the large screen near reception, the news feed carried a red strip about disruptions in Nordic banking services. Under it, smaller, a line about heightened cyber readiness after attacks on Ukrainian infrastructure.

I did not connect the two.

This is one of the humiliations of technical work: one can be surrounded by the pattern and still honestly see only the field one is paid to inspect.

I told Aditi it was probably vendor bleed-through from the support fallback test.

She wrote: *Probably is doing a lot there.*

She was right. I ignored the tone because ignoring tone is one of the ways engineers remain employable.

At 09:11, I filed an internal incident with low severity. Customer-facing traffic in research namespace. No confirmed exposure. Monitor.

The word monitor is a beautiful place to hide.

