import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { Box, useMediaQuery } from '@mui/material';

import { formatCurrency } from '@/utils/formatters';

/*
 * Quantas voltas completas cada dígito dá
 * antes de parar no número certo.
 *
 * Quanto menor, mais curto e suave é o giro.
 */
const DEFAULT_CYCLES = 2;

const DEFAULT_DURATION = 950;

const DEFAULT_DELAY_STEP = 45;

/*
 * Folga depois do último giro antes de voltar
 * para o texto normal.
 */
const DEFAULT_SETTLE_DELAY = 900;

/*
 * Altura de cada dígito da bobina.
 * Em "em" para acompanhar o fontSize herdado.
 */
const DIGIT_HEIGHT_EM = 1.15;

/*
 * Saída suave, sem repique no final.
 */
const EASING = 'cubic-bezier(0.25, 0.8, 0.3, 1)';

interface RollingSettings {
  active: boolean;
  cycles?: number;
  duration?: number;
  delayStep?: number;
  settleDelay?: number;
}

/*
 * Permite configurar o giro de um bloco inteiro
 * sem precisar passar prop em cada número.
 */
const RollingContext =
  createContext<RollingSettings>({
    active: true,
  });

interface RollingActiveProviderProps
  extends RollingSettings {
  children: ReactNode;
}

export function RollingActiveProvider({
  children,
  ...settings
}: RollingActiveProviderProps) {
  const value = useMemo(
    () => settings,
    [
      settings.active,
      settings.cycles,
      settings.delayStep,
      settings.duration,
      settings.settleDelay,
    ],
  );

  return (
    <RollingContext.Provider value={value}>
      {children}
    </RollingContext.Provider>
  );
}

/*
 * Marca o elemento como visto assim que ele
 * entra na tela, uma única vez.
 *
 * threshold: quanto do elemento precisa estar
 * visível, de 0 a 1.
 *
 * rootMargin: encolhe a área de detecção. Um
 * valor negativo embaixo, como
 * "0px 0px -160px 0px", só considera visível
 * quando o elemento sobe mais na tela.
 *
 * Retorna uma ref de callback, então funciona
 * mesmo quando o elemento monta depois.
 */
export function useInViewOnce(
  threshold = 0.2,
  rootMargin = '0px',
) {
  const [node, setNode] =
    useState<HTMLElement | null>(null);

  const [inView, setInView] =
    useState(false);

  useEffect(() => {
    if (!node || inView) {
      return;
    }

    if (
      typeof IntersectionObserver ===
      'undefined'
    ) {
      setInView(true);

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some(
          (entry) => entry.isIntersecting,
        );

        if (visible) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [inView, node, rootMargin, threshold]);

  return [setNode, inView] as const;
}

interface RollingCurrencyProps {
  value: number;

  /*
   * Voltas completas antes de parar.
   */
  cycles?: number;

  /*
   * Duração do giro em ms.
   */
  duration?: number;

  /*
   * Atraso entre um dígito e o próximo,
   * o que cria o efeito de parada em cascata.
   */
  delayStep?: number;

  /*
   * Atraso inicial do card ou da linha em ms.
   * Serve para escalonar um bloco após o outro.
   */
  startDelay?: number;

  /*
   * Quanto tempo o número fica parado na bobina
   * depois do giro, antes de voltar para o
   * texto normal.
   */
  settleDelay?: number;

  /*
   * Quando false, os dígitos ficam parados
   * esperando. Se não informado, usa o valor
   * do RollingActiveProvider mais próximo.
   */
  active?: boolean;

  /*
   * Formatador opcional.
   * Por padrão usa o formatCurrency do projeto.
   */
  format?: (value: number) => string;
}

export function RollingCurrency({
  value,
  cycles,
  duration,
  delayStep,
  startDelay = 0,
  settleDelay,
  active,
  format = formatCurrency,
}: RollingCurrencyProps) {
  const settings = useContext(RollingContext);

  /*
   * Prop explícita ganha do provider,
   * que ganha do padrão.
   */
  const isActive =
    active ?? settings.active;

  const finalCycles =
    cycles ??
    settings.cycles ??
    DEFAULT_CYCLES;

  const finalDuration =
    duration ??
    settings.duration ??
    DEFAULT_DURATION;

  const finalDelayStep =
    delayStep ??
    settings.delayStep ??
    DEFAULT_DELAY_STEP;

  const finalSettleDelay =
    settleDelay ??
    settings.settleDelay ??
    DEFAULT_SETTLE_DELAY;

  const text = useMemo(
    () => format(value),
    [format, value],
  );

  const digitCount = useMemo(
    () => (text.match(/\d/g) ?? []).length,
    [text],
  );

  const reel = useMemo(
    () =>
      Array.from(
        { length: finalCycles * 10 + 10 },
        (_, index) => index % 10,
      ),
    [finalCycles],
  );

  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  const [rolled, setRolled] = useState(false);

  /*
   * Quando o giro termina voltamos para o
   * texto normal.
   *
   * A bobina posiciona os dígitos com translate
   * em "em", o que cai em fração de pixel e
   * deixa um dígito levemente acima do outro.
   * O texto puro usa o alinhamento nativo e
   * fica sempre certo.
   */
  const [finished, setFinished] =
    useState(false);

  useEffect(() => {
    if (!isActive) {
      setRolled(false);
      setFinished(false);

      return;
    }

    if (prefersReducedMotion) {
      setRolled(true);
      setFinished(true);

      return;
    }

    setRolled(false);
    setFinished(false);

    /*
     * Dois frames: o primeiro aplica a posição
     * inicial, o segundo dispara a transição.
     */
    let secondFrame = 0;

    const firstFrame =
      window.requestAnimationFrame(() => {
        secondFrame =
          window.requestAnimationFrame(() => {
            setRolled(true);
          });
      });

    const totalDuration =
      startDelay +
      Math.max(digitCount - 1, 0) *
        finalDelayStep +
      finalDuration +
      finalSettleDelay;

    const settleTimer = window.setTimeout(
      () => {
        setFinished(true);
      },
      totalDuration,
    );

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(settleTimer);
    };
  }, [
    digitCount,
    finalDelayStep,
    finalDuration,
    finalSettleDelay,
    isActive,
    prefersReducedMotion,
    startDelay,
    text,
  ]);

  if (prefersReducedMotion || finished) {
    return <>{text}</>;
  }

  const characters = text.split('');

  let digitPosition = -1;

  return (
    <Box
      component="span"
      aria-label={text}
      sx={{
        display: 'inline-block',

        verticalAlign: 'bottom',
        whiteSpace: 'nowrap',
      }}
    >
      {characters.map((character, index) => {
        const isDigit =
          character >= '0' && character <= '9';

        if (!isDigit) {
          return (
            <Box
              key={`static-${index}`}
              component="span"
              aria-hidden="true"
              sx={{
                display: 'inline-block',

                height: `${DIGIT_HEIGHT_EM}em`,
                lineHeight: `${DIGIT_HEIGHT_EM}em`,

                verticalAlign: 'bottom',
              }}
            >
              {character}
            </Box>
          );
        }

        digitPosition += 1;

        const target = Number(character);

        const offset = rolled
          ? finalCycles * 10 + target
          : 0;

        return (
          <Box
            key={`digit-${index}`}
            component="span"
            aria-hidden="true"
            sx={{
              display: 'inline-block',
              overflow: 'hidden',

              height: `${DIGIT_HEIGHT_EM}em`,

              verticalAlign: 'bottom',
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'block',

                transform: `translateY(-${
                  offset * DIGIT_HEIGHT_EM
                }em)`,

                transition: `transform ${finalDuration}ms ${EASING}`,

                transitionDelay: `${
                  startDelay +
                  digitPosition * finalDelayStep
                }ms`,

                willChange: 'transform',
              }}
            >
              {reel.map((digit, reelIndex) => (
                <Box
                  key={`reel-${reelIndex}`}
                  component="span"
                  sx={{
                    display: 'block',

                    height: `${DIGIT_HEIGHT_EM}em`,
                    lineHeight: `${DIGIT_HEIGHT_EM}em`,

                    textAlign: 'center',
                  }}
                >
                  {digit}
                </Box>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}