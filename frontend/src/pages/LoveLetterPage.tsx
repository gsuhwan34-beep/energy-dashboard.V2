import { useCallback, useState } from 'react'

const LETTER = `Jag har varit så överväldigad och utmattad på sistone, och jag vet att du också går igenom en riktigt tuff period... Jag är så ledsen att jag inte har funnits där för att lyssna på dig, umgås och stötta dig.

Det jag sa till dig idag – jag var egentligen inte arg på dig. Jag tror bara att jag nådde botten och tappade kontrollen över mina känslor, och allt bara vällde ut. När jag är så här utmattad, har sömnbrist och är stressad, så krävs det så lite för att jag ska tappa tålamodet och låta allt gå ut över dig... Jag är så, så ledsen.

Men ändå sa du till mig: 'Jag älskar dig alltid.' Tack så jättemycket, och jag älskar dig också. Jag vill verkligen att vårt förhållande ska vara livet ut. Jag hoppas du förstår att anledningen till att jag pressar mig själv så hårt och studerar så passionerat är för vår långsiktiga framtid tillsammans.

Jag är så ledsen. Jag lovar att göra mitt absolut bästa och behandla dig så mycket bättre. Jag ska ta bättre hand om min hälsa och mitt mående också. Tack för allt, och jag är så ledsen. Min älskade, min skatt – du är den värdefullaste människan i världen för mig.`

const HEARTS = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 12) * 0.16}s`,
  duration: `${3.2 + (index % 7) * 0.35}s`,
  size: `${15 + (index % 6) * 5}px`,
  symbol: index % 5 === 0 ? '✨' : index % 3 === 0 ? '💕' : '❤️',
}))

export default function LoveLetterPage() {
  const [accepted, setAccepted] = useState(false)
  const [noPosition, setNoPosition] = useState({ left: '56%', top: '61%' })

  const moveNoButton = useCallback(() => {
    const buttonWidth = 110
    const buttonHeight = 54
    const padding = 18
    const maxX = Math.max(padding, window.innerWidth - buttonWidth - padding)
    const maxY = Math.max(padding, window.innerHeight - buttonHeight - padding)

    setNoPosition({
      left: `${padding + Math.random() * (maxX - padding)}px`,
      top: `${padding + Math.random() * (maxY - padding)}px`,
    })
  }, [])

  return (
    <main className={`love-experience ${accepted ? 'is-accepted' : ''}`}>
      <div className="love-ambient love-ambient-one" />
      <div className="love-ambient love-ambient-two" />

      {!accepted ? (
        <section className="love-question-card" aria-labelledby="love-question">
          <span className="love-envelope" aria-hidden="true">💌</span>
          <p className="love-eyebrow">ONE IMPORTANT QUESTION</p>
          <h2 id="love-question">Do you love me?</h2>
          <p className="love-hint">Choose carefully, my love ♡</p>
          <button className="love-yes-button" type="button" onClick={() => setAccepted(true)}>
            YES <span aria-hidden="true">♥</span>
          </button>
          <button
            className="love-no-button"
            style={noPosition}
            type="button"
            onPointerEnter={moveNoButton}
            onPointerDown={(event) => { event.preventDefault(); moveNoButton() }}
            onTouchStart={(event) => { event.preventDefault(); moveNoButton() }}
            onFocus={moveNoButton}
            onClick={(event) => { event.preventDefault(); moveNoButton() }}
            aria-label="No (this button runs away)"
          >
            NO
          </button>
        </section>
      ) : (
        <section className="love-answer" aria-live="polite">
          <div className="heart-rain" aria-hidden="true">
            {HEARTS.map((heart) => (
              <span key={heart.id} style={{ left: heart.left, animationDelay: heart.delay, animationDuration: heart.duration, fontSize: heart.size }}>
                {heart.symbol}
              </span>
            ))}
          </div>
          <div className="love-letter-card">
            <span className="love-envelope love-envelope-open" aria-hidden="true">💖</span>
            <p className="love-eyebrow">YOU MADE MY HEART SO HAPPY</p>
            <h2>I love you too! ❤️</h2>
            <div className="love-divider"><span>♥</span></div>
            <div className="love-letter-copy">
              {LETTER.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <p className="love-signoff">Forever yours ♡</p>
          </div>
        </section>
      )}
    </main>
  )
}
