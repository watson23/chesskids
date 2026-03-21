"use client";

import Link from "next/link";
import Piku from "@/components/Piku";
import { useAudio } from "@/hooks/useAudio";

const EFFECTIVE_DATE = "2026-03-21";

function EnglishPolicy() {
  return (
    <>
      <Section title="Introduction">
        <p>
          Piku Chess (&quot;My First Chess Moves&quot;) is a free chess learning app designed
          for children ages 3&ndash;6. It is developed by an independent creator and is
          not operated by a large company. We are committed to protecting the privacy
          of children and their families.
        </p>
      </Section>

      <Section title="What Data We Collect">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Anonymous account ID</strong> &mdash; A randomly generated identifier
            created by Firebase Authentication. It is not linked to any personal
            information such as email, name, or device ID.
          </li>
          <li>
            <strong>Player name and avatar</strong> &mdash; A first name and emoji avatar
            chosen by a parent or guardian when creating a player profile.
          </li>
          <li>
            <strong>Game progress</strong> &mdash; Lesson completion, stars earned, puzzle
            progress, unlocked rewards, and board/piece preferences.
          </li>
        </ul>
      </Section>

      <Section title="What We Do NOT Collect">
        <p>
          We do not collect email addresses, real names, physical addresses, phone
          numbers, photos, location data, device identifiers, browsing history,
          contact lists, or any other personal information. We do not use analytics,
          advertising, or tracking of any kind.
        </p>
      </Section>

      <Section title="Why We Collect Data">
        <p>
          The data listed above is collected solely to save game progress on the
          device and allow parents to manage player profiles. It is not used for
          any other purpose.
        </p>
      </Section>

      <Section title="How Data Is Stored">
        <p>
          Data is stored in Google Firebase/Firestore, a cloud service operated by
          Google LLC. Data is encrypted in transit (HTTPS) and at rest. Access is
          restricted to the anonymous account that created it &mdash; no other user
          or account can read or modify it.
        </p>
        <p>
          Some preferences (language, sound settings) are also stored locally on the
          device using browser localStorage.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          Data is kept until the user deletes it via the in-app Settings menu.
          Anonymous accounts that have been inactive for 30 days may be automatically
          cleaned up.
        </p>
      </Section>

      <Section title="Third-Party Sharing">
        <p>
          We do not share, sell, or disclose any data to third parties. Google
          Firebase/Firestore is used solely as an infrastructure provider to store
          data, under their standard data processing terms.
        </p>
        <p>
          We do not use any advertising services, analytics services, or social
          media integrations.
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>
          This app is designed for children ages 3&ndash;6. We comply with the
          U.S. Children&apos;s Online Privacy Protection Act (COPPA) and the EU
          General Data Protection Regulation (GDPR) Article 8 regarding children&apos;s
          data.
        </p>
        <p>
          We do not knowingly collect personal information from children. The app
          uses anonymous authentication only &mdash; no email, password, or
          identifiable account information is collected. A child&apos;s first name,
          entered by a parent, is the only user-provided text stored, and it is not
          combined with any other data that could identify the child.
        </p>
      </Section>

      <Section title="Parental Rights">
        <p>Parents and guardians can at any time:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Review</strong> their child&apos;s data directly in the app
            (player profiles, progress, and rewards are all visible).
          </li>
          <li>
            <strong>Delete</strong> all data by opening Settings and tapping
            &quot;Delete All Data.&quot; This permanently removes the account,
            all player profiles, and all progress.
          </li>
          <li>
            <strong>Refuse</strong> further data storage by deleting the account.
            The app can still be used after deletion &mdash; a new anonymous account
            will be created, but previous progress will be lost.
          </li>
        </ul>
      </Section>

      <Section title="Cookies and Tracking">
        <p>
          This app does not use cookies, tracking pixels, fingerprinting, or any
          other tracking technologies. Browser localStorage is used only to store
          game preferences (language, sound settings, active player).
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          If you have questions or concerns about this privacy policy or your
          data, please contact us at:{" "}
          <a href="mailto:privacy@pikuchess.com" className="underline text-amber-700">
            privacy@pikuchess.com
          </a>
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>
          We may update this policy from time to time. The effective date at the
          top of this page will be updated accordingly. We encourage you to review
          this policy periodically.
        </p>
      </Section>
    </>
  );
}

function FinnishPolicy() {
  return (
    <>
      <Section title="Johdanto">
        <p>
          Piku Chess (&quot;My First Chess Moves&quot;) on ilmainen shakinoppimissovellus,
          joka on suunniteltu 3&ndash;6-vuotiaille lapsille. Sen on kehittänyt
          yksittäinen tekijä, ei suuri yritys. Olemme sitoutuneet suojelemaan
          lasten ja heidän perheidensä yksityisyyttä.
        </p>
      </Section>

      <Section title="Mitä tietoja keräämme">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Anonyymi tilitunniste</strong> &mdash; Firebase Authenticationin
            luoma satunnainen tunniste. Sitä ei ole yhdistetty mihinkään
            henkilötietoon, kuten sähköpostiin, nimeen tai laitetunnisteeseen.
          </li>
          <li>
            <strong>Pelaajan nimi ja avatar</strong> &mdash; Vanhemman tai huoltajan
            valitsema etunimi ja emoji-avatar pelaajaprofiilin luomisen yhteydessä.
          </li>
          <li>
            <strong>Peliedistyminen</strong> &mdash; Oppituntien suoritus, ansaitut
            tähdet, tehtävien edistyminen, avatut palkinnot sekä lauta- ja
            nappula-asetukset.
          </li>
        </ul>
      </Section>

      <Section title="Mitä emme kerää">
        <p>
          Emme kerää sähköpostiosoitteita, oikeita nimiä, fyysisiä osoitteita,
          puhelinnumeroita, valokuvia, sijaintitietoja, laitetunnisteita,
          selaushistoriaa, yhteystietoluetteloita tai muita henkilötietoja. Emme
          käytä analytiikkaa, mainontaa tai minkäänlaista seurantaa.
        </p>
      </Section>

      <Section title="Miksi keräämme tietoja">
        <p>
          Yllä luetellut tiedot kerätään ainoastaan peliedistymisen tallentamiseksi
          laitteelle ja vanhempien pelaajaprofiiilein hallintaan. Niitä ei käytetä
          mihinkään muuhun tarkoitukseen.
        </p>
      </Section>

      <Section title="Miten tiedot tallennetaan">
        <p>
          Tiedot tallennetaan Google Firebase/Firestoreen, Google LLC:n
          ylläpitämään pilvipalveluun. Tiedot salataan siirron aikana (HTTPS) ja
          levossa. Pääsy on rajoitettu tiedot luoneeseen anonyymiin tiliin &mdash;
          kukaan muu käyttäjä tai tili ei voi lukea tai muokata niitä.
        </p>
        <p>
          Joitain asetuksia (kieli, ääniasetukset) tallennetaan myös paikallisesti
          laitteelle selaimen localStorageen.
        </p>
      </Section>

      <Section title="Tietojen säilytys">
        <p>
          Tiedot säilytetään, kunnes käyttäjä poistaa ne sovelluksen
          Asetukset-valikosta. Anonyymit tilit, jotka ovat olleet käyttämättömänä
          30 päivää, voidaan poistaa automaattisesti.
        </p>
      </Section>

      <Section title="Tietojen jakaminen kolmansille osapuolille">
        <p>
          Emme jaa, myy tai luovuta tietoja kolmansille osapuolille. Google
          Firebase/Firestorea käytetään ainoastaan infrastruktuurin tarjoajana
          tietojen tallentamiseen heidän vakiotietojenkäsittelyehtojensa
          mukaisesti.
        </p>
        <p>
          Emme käytä mainontapalveluita, analytiikkapalveluita tai
          sosiaalisen median integraatioita.
        </p>
      </Section>

      <Section title="Lasten yksityisyys">
        <p>
          Tämä sovellus on suunniteltu 3&ndash;6-vuotiaille lapsille. Noudatamme
          Yhdysvaltain COPPA-lakia (Children&apos;s Online Privacy Protection Act)
          ja EU:n yleisen tietosuoja-asetuksen (GDPR) artiklaa 8 lasten
          tietojen osalta.
        </p>
        <p>
          Emme tietoisesti kerää henkilötietoja lapsilta. Sovellus käyttää
          ainoastaan anonyymiä todennusta &mdash; sähköpostia, salasanaa tai
          tunnistettavaa tilitietoa ei kerätä. Vanhemman syöttämä lapsen etunimi
          on ainoa käyttäjän antama teksti, joka tallennetaan, eikä sitä yhdistetä
          mihinkään muuhun tietoon, joka voisi tunnistaa lapsen.
        </p>
      </Section>

      <Section title="Vanhempien oikeudet">
        <p>Vanhemmat ja huoltajat voivat milloin tahansa:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Tarkastella</strong> lapsensa tietoja suoraan sovelluksessa
            (pelaajaprofiili, edistyminen ja palkinnot ovat kaikki näkyvissä).
          </li>
          <li>
            <strong>Poistaa</strong> kaikki tiedot avaamalla Asetukset ja
            napauttamalla &quot;Poista kaikki tiedot.&quot; Tämä poistaa
            pysyvästi tilin, kaikki pelaajaprofiilit ja kaiken edistymisen.
          </li>
          <li>
            <strong>Kieltäytyä</strong> jatkuvasta tietojen tallennuksesta
            poistamalla tilin. Sovellusta voi silti käyttää poiston jälkeen
            &mdash; uusi anonyymi tili luodaan, mutta aiempi edistyminen
            menetetään.
          </li>
        </ul>
      </Section>

      <Section title="Evästeet ja seuranta">
        <p>
          Tämä sovellus ei käytä evästeitä, seurantapikseleitä,
          selaintunnistusta tai muita seurantateknologioita. Selaimen
          localStoragea käytetään ainoastaan peliasetuksen tallentamiseen
          (kieli, ääniasetukset, aktiivinen pelaaja).
        </p>
      </Section>

      <Section title="Ota yhteyttä">
        <p>
          Jos sinulla on kysyttävää tästä tietosuojakäytännöstä tai
          tiedoistasi, ota yhteyttä:{" "}
          <a href="mailto:privacy@pikuchess.com" className="underline text-amber-700">
            privacy@pikuchess.com
          </a>
        </p>
      </Section>

      <Section title="Muutokset tähän käytäntöön">
        <p>
          Saatamme päivittää tätä käytäntöä ajoittain. Tämän sivun yläosassa
          oleva voimaantulopäivä päivitetään vastaavasti. Suosittelemme
          tarkistamaan tämän käytännön säännöllisesti.
        </p>
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-bold text-amber-900">{title}</h3>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  const { language, setLanguage, t } = useAudio();

  return (
    <div className="min-h-dvh bg-amber-50/50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-amber-100 px-4 py-3 flex items-center justify-between">
        <Link
          href="/login"
          className="text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
        >
          &larr; {t("privacy_back")}
        </Link>
        <div className="flex gap-1.5">
          <button
            onClick={() => setLanguage("en")}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              language === "en"
                ? "bg-amber-100 ring-1 ring-amber-400"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("fi")}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
              language === "fi"
                ? "bg-amber-100 ring-1 ring-amber-400"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            FI
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-5 py-8">
        <div className="flex flex-col items-center gap-3 mb-8">
          <Piku expression="teaching" size={80} />
          <h1 className="text-2xl font-extrabold text-amber-900">
            {t("privacy_title")}
          </h1>
          <p className="text-xs text-gray-500">
            {language === "fi" ? "Voimassa:" : "Effective:"} {EFFECTIVE_DATE}
          </p>
        </div>

        <div className="space-y-6">
          {language === "fi" ? <FinnishPolicy /> : <EnglishPolicy />}
        </div>
      </div>
    </div>
  );
}
