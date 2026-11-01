import Countdown from "./components/Countdown";
import IntroExperience from "./components/IntroExperience";
import MusicPlayer from "./components/MusicPlayer";

const storyMoments = [
  { number: "01", eyebrow: "Pagi pertama", title: "Memulai hari di Kawah Putih", text: "Kabut, udara dingin, dan Ontang-Anting menjadi pembuka perjalanan yang sudah lama kita bayangkan.", href: "https://www.instagram.com/reels/DHvu2qhyZXz/", provider: "Lihat referensi Instagram" },
  { number: "02", eyebrow: "Siang berdua", title: "Mencari hangat di Rengganis", text: "Jembatan gantung, Keranjang Sultan, dan waktu yang kita sisihkan untuk menikmati perjalanan tanpa terburu-buru.", href: "https://www.tiktok.com/@eunike_octaviani/video/7667905164656839956", provider: "Putar referensi TikTok" },
  { number: "03", eyebrow: "Penutup hari", title: "Pulang membawa cerita dari Braga", text: "Setelah perjalanan panjang dari Ciwidey, kita menutup hari dengan makan malam dan lampu-lampu kota Bandung.", href: "https://www.tiktok.com/@mainbandung.yuk/video/7701695826116054290", provider: "Putar referensi TikTok" },
];

const tripDetails = [
  { label: "Tujuan", value: "Bandung", icon: "⌖" },
  { label: "Tanggal", value: "15 Nov 2026", icon: "◷" },
  { label: "Suasana", value: "Hangat & tenang", icon: "♡" },
];

const bucketItems = [
  { title: "Kawah Putih", meta: "06.00–10.30 · Rancabali, Ciwidey", tag: "Instagram", href: "https://www.instagram.com/reels/DHvu2qhyZXz/" },
  { title: "Sunan Ibu", meta: "Kawasan Kawah Putih, Ciwidey", tag: "TikTok", href: "https://www.tiktok.com/@andinostory/video/7511990098645306631" },
  { title: "Kawah Rengganis", meta: "13.30–15.00 · Rancabali, Ciwidey", tag: "TikTok", href: "https://www.tiktok.com/@eunike_octaviani/video/7667905164656839956" },
  { title: "Kebun Teh Rancabali", meta: "15.00–15.30 · Rancabali, Ciwidey", tag: "TikTok", href: "https://www.tiktok.com/@neorentalmotorbdg/video/7276414435416100101" },
  { title: "Kebun Stroberi Ciwidey", meta: "16.15–16.45 · Jalur Ciwidey", tag: "Instagram", href: "https://www.instagram.com/reels/C6YBhfPv2R2/" },
  { title: "Braga", meta: "19.00–19.45 · Bandung", tag: "TikTok", href: "https://www.tiktok.com/@mainbandung.yuk/video/7701695826116054290" },
];

function HeartMark({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "heart-mark heart-mark--small" : "heart-mark"} aria-hidden="true">
      <svg viewBox="0 0 56 56" role="img">
        <path d="M28 46.5C21.8 40.8 9.5 32.4 9.5 21.4 9.5 14.8 14.1 10 20.3 10c3.6 0 6.4 1.7 7.7 4.3 1.3-2.6 4.1-4.3 7.7-4.3 6.2 0 10.8 4.8 10.8 11.4 0 11-12.3 19.4-18.5 25.1Z" />
        <path className="heart-mark__line" d="M18 24.4c2.8-5.6 8.3-7.5 13.7-4.7" />
      </svg>
    </span>
  );
}

export default function Home() {
  return (
    <main>
      <IntroExperience />
      <section className="hero" id="home">
        <div className="hero__image" aria-hidden="true" />
        <div className="hero__veil" aria-hidden="true" />
        <nav className="nav shell" aria-label="Navigasi utama">
          <a className="brand" href="#home" aria-label="Beranda Our Journey">
            <HeartMark small />
            <span><strong>Our Journey</strong><em>Dimas &amp; Anita</em></span>
          </a>
          <div className="nav__links">
            <a href="#story">Kisah Kita</a><a href="#memories">Kenangan</a><a href="#trip">Perjalanan</a><a href="#bucket">Bucket List</a>
          </div>
          <a className="nav__date" href="/manage"><span>Our private space</span><strong>Kelola destinasi ↗</strong></a>
        </nav>

        <div className="hero__content shell">
          <div className="hero__copy reveal">
            <p className="eyebrow eyebrow--light"><span /> Our next chapter</p>
            <h1>Dua hati,<br /><i>satu perjalanan.</i></h1>
            <p className="hero__lede">Sebuah ruang kecil untuk menyimpan cerita, merayakan setiap kenangan, dan merencanakan petualangan yang akan kita jalani berdua.</p>
            <div className="hero__actions">
              <a className="button button--light" href="#story">Buka cerita kita <span>↗</span></a>
              <a className="text-link text-link--light" href="#trip"><span className="play">▶</span> Lihat rencana Bandung</a>
            </div>
          </div>
          <div className="hero__note reveal reveal--delay"><span className="hero__note-line" /><p>“Bukan tentang ke mana kita pergi, tapi tentang siapa yang ada di samping kita.”</p></div>
        </div>

        <div className="hero__bottom shell">
          <a href="#story" className="scroll-cue" aria-label="Gulir ke kisah kita"><span className="scroll-cue__mouse"><i /></span><span>Scroll to feel</span></a>
          <p>Est. in love · Forever in progress</p>
        </div>
      </section>

      <section className="countdown section" aria-labelledby="countdown-title">
        <div className="petal petal--one" aria-hidden="true" /><div className="petal petal--two" aria-hidden="true" />
        <div className="shell countdown__grid">
          <div className="countdown__intro reveal-on-scroll">
            <p className="eyebrow"><span /> Menuju hari istimewa</p>
            <h2 id="countdown-title">Menghitung hari menuju<br /><i>cerita baru kita.</i></h2>
            <p>Setiap detik membawa kita lebih dekat pada dinginnya Bandung dan hangatnya kebersamaan.</p>
          </div>
          <Countdown />
        </div>
      </section>

      <section className="story section" id="story" aria-labelledby="story-title">
        <div className="shell">
          <div className="section-heading section-heading--center reveal-on-scroll">
            <HeartMark />
            <p className="eyebrow"><span /> Bab pertama kita <span /></p>
            <h2 id="story-title">Satu hari di Bandung,<br /><i>enam cerita untuk dibawa pulang.</i></h2>
            <p>Kisah ini belum menjadi kenangan. Untuk sekarang, ia adalah rencana kecil yang sedang kita siapkan bersama.</p>
          </div>
          <div className="story__timeline" id="memories">
            {storyMoments.map((moment, index) => (
              <article className="story-card reveal-on-scroll" key={moment.number}>
                <div className="story-card__top"><span className="story-card__number">{moment.number}</span><span className="story-card__dot" aria-hidden="true" /></div>
                <p className="story-card__eyebrow">{moment.eyebrow}</p><h3>{moment.title}</h3><p>{moment.text}</p>
                <a className="story-card__link" href={moment.href} target="_blank" rel="noreferrer" aria-label={`${moment.provider}: ${moment.title}`}>{moment.provider} <span>↗</span></a>
                {index === 2 && <span className="story-card__soon">15.11</span>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="trip section" id="trip" aria-labelledby="trip-title">
        <div className="shell trip__grid">
          <div className="trip__visual reveal-on-scroll">
            <div className="trip__photo" role="img" aria-label="Pemandangan romantis pegunungan Bandung" />
            <div className="postcard postcard--top"><span>our next stop</span><strong>Bandung</strong><small>15.11.2026</small></div>
            <div className="postcard postcard--bottom"><span className="postcard__pin">⌖</span><div><strong>Save the date</strong><small>Petualangan kita dimulai</small></div></div>
          </div>
          <div className="trip__content reveal-on-scroll">
            <p className="eyebrow"><span /> Romantic trip planner</p><h2 id="trip-title">Bandung menunggu<br /><i>cerita kita.</i></h2>
            <p className="trip__lede">Udara sejuk, secangkir kopi hangat, dan banyak jalan yang belum pernah kita lalui. Ini adalah rancangan awal untuk perjalanan yang akan selalu kita ingat.</p>
            <div className="trip__details">
              {tripDetails.map((detail) => <div className="trip-detail" key={detail.label}><span>{detail.icon}</span><div><small>{detail.label}</small><strong>{detail.value}</strong></div></div>)}
            </div>
            <a className="button button--dark" href="#bucket">Jelajahi rencana perjalanan <span>↗</span></a>
          </div>
        </div>
      </section>

      <section className="bucket section" id="bucket" aria-labelledby="bucket-title">
        <div className="shell">
          <div className="bucket__header reveal-on-scroll"><div><p className="eyebrow"><span /> Referensi perjalanan</p><h2 id="bucket-title">Enam tempat untuk<br /><i>satu hari milik kita.</i></h2></div><p>Setiap destinasi memiliki referensi video yang bisa dibuka sambil menyusun rencana bersama.</p></div>
          <div className="bucket__list">
            {bucketItems.map((item, index) => (
              <article className="bucket-row reveal-on-scroll" key={item.title}>
                <span className="bucket-row__index">0{index + 1}</span><span className="bucket-row__check" aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.meta}</p></div><span className="bucket-row__tag">{item.tag}</span><a href={item.href} target="_blank" rel="noreferrer" aria-label={`Buka referensi ${item.title}`}>↗</a>
              </article>
            ))}
          </div>
          <p className="bucket__more"><a href="/manage">Buka planner untuk memberi reaction dan pesan <span>♡</span></a></p>
        </div>
      </section>

      <section className="letter section" aria-labelledby="letter-title">
        <div className="letter__glow" aria-hidden="true" />
        <div className="shell letter__inner reveal-on-scroll"><HeartMark /><p className="eyebrow eyebrow--light"><span /> A little note for Anita <span /></p><h2 id="letter-title">Ke mana pun langkah membawa kita,<br /><i>aku ingin menjalaninya bersamamu.</i></h2><p>Ini baru permulaan. Akan ada lebih banyak kota, lebih banyak foto, lebih banyak tawa, dan lebih banyak alasan untuk saling memilih—setiap hari.</p><div className="signature"><span>with all my heart,</span><strong>Dimas.</strong></div></div>
      </section>

      <footer className="footer"><div className="shell footer__inner"><a className="brand brand--footer" href="#home"><HeartMark small /><span><strong>Our Journey</strong><em>Dimas &amp; Anita</em></span></a><p>Dibuat dengan cinta, untuk semua cerita yang belum terjadi.</p><a href="/manage" className="back-top">Buka planner <span>↗</span></a></div></footer>
      <MusicPlayer />
    </main>
  );
}
