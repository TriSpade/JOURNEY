import Countdown from "./components/Countdown";

const storyMoments = [
  { number: "01", eyebrow: "Awal cerita", title: "Saat semesta mempertemukan kita", text: "Dari percakapan sederhana, tumbuh sebuah tempat pulang yang selalu ingin kita jaga bersama." },
  { number: "02", eyebrow: "Hari-hari kecil", title: "Bahagia dalam hal yang sederhana", text: "Tawa, cerita larut malam, dan segala hal kecil yang diam-diam menjadi kenangan paling berharga." },
  { number: "03", eyebrow: "Bab berikutnya", title: "Bandung, kita akan datang", text: "Sebuah perjalanan baru untuk udara yang sejuk, jalan yang panjang, dan waktu yang hanya milik kita." },
];

const tripDetails = [
  { label: "Tujuan", value: "Bandung", icon: "⌖" },
  { label: "Tanggal", value: "15 Nov 2026", icon: "◷" },
  { label: "Suasana", value: "Hangat & tenang", icon: "♡" },
];

const bucketItems = [
  { title: "Menyambut pagi di kebun teh", meta: "Pangalengan", tag: "Alam" },
  { title: "Makan malam dengan city lights", meta: "Bandung Utara", tag: "Kuliner" },
  { title: "Berburu foto di jalanan kota", meta: "Braga", tag: "Kenangan" },
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
          <a className="nav__date" href="#trip"><span>Bandung</span><strong>15 · 11 · 2026</strong></a>
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
            <p className="eyebrow"><span /> Our love story <span /></p>
            <h2 id="story-title">Kisah yang kita tulis,<br /><i>perlahan dan selamanya.</i></h2>
            <p>Setiap pertemuan, tawa, dan perjalanan adalah halaman yang tidak ingin kita lewatkan.</p>
          </div>
          <div className="story__timeline" id="memories">
            {storyMoments.map((moment, index) => (
              <article className="story-card reveal-on-scroll" key={moment.number}>
                <div className="story-card__top"><span className="story-card__number">{moment.number}</span><span className="story-card__dot" aria-hidden="true" /></div>
                <p className="story-card__eyebrow">{moment.eyebrow}</p><h3>{moment.title}</h3><p>{moment.text}</p>
                <button type="button" className="story-card__link" aria-label={`Baca ${moment.title}`}>Baca cerita <span>→</span></button>
                {index === 2 && <span className="story-card__soon">Soon</span>}
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
          <div className="bucket__header reveal-on-scroll"><div><p className="eyebrow"><span /> Our bucket list</p><h2 id="bucket-title">Hal-hal kecil yang ingin<br /><i>kita lakukan bersama.</i></h2></div><p>Daftar mimpi yang menunggu untuk dicentang—satu per satu, berdua.</p></div>
          <div className="bucket__list">
            {bucketItems.map((item, index) => (
              <article className="bucket-row reveal-on-scroll" key={item.title}>
                <span className="bucket-row__index">0{index + 1}</span><span className="bucket-row__check" aria-hidden="true" /><div><h3>{item.title}</h3><p>{item.meta}</p></div><span className="bucket-row__tag">{item.tag}</span><button type="button" aria-label={`Lihat ${item.title}`}>↗</button>
              </article>
            ))}
          </div>
          <p className="bucket__more">dan masih banyak mimpi lainnya <span>♡</span></p>
        </div>
      </section>

      <section className="letter section" aria-labelledby="letter-title">
        <div className="letter__glow" aria-hidden="true" />
        <div className="shell letter__inner reveal-on-scroll"><HeartMark /><p className="eyebrow eyebrow--light"><span /> A little note for Anita <span /></p><h2 id="letter-title">Ke mana pun langkah membawa kita,<br /><i>aku ingin menjalaninya bersamamu.</i></h2><p>Ini baru permulaan. Akan ada lebih banyak kota, lebih banyak foto, lebih banyak tawa, dan lebih banyak alasan untuk saling memilih—setiap hari.</p><div className="signature"><span>with all my heart,</span><strong>Dimas.</strong></div></div>
      </section>

      <footer className="footer"><div className="shell footer__inner"><a className="brand brand--footer" href="#home"><HeartMark small /><span><strong>Our Journey</strong><em>Dimas &amp; Anita</em></span></a><p>Dibuat dengan cinta, untuk semua cerita yang belum terjadi.</p><a href="#home" className="back-top">Kembali ke atas <span>↑</span></a></div></footer>
    </main>
  );
}
