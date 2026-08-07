import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';

import Lottie, {
  type LottieRefCurrentProps,
} from 'lottie-react';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import {
  Box,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Portal,
  Tooltip,
  Typography,
} from '@mui/material';

import gearAnimation from '@/assets/Fun Gear.json';
import logoutAnimation from '@/assets/Log out.json';
import uploadAnimation from '@/assets/Uploading to cloud.json';
import { ImportacaoMaoObraSection } from '@/components/importacao/ImportacaoMaoObraSection';

const LEFT_EYE_ID = 'gear-eye-left-track';
const RIGHT_EYE_ID = 'gear-eye-right-track';
const LIMB_ELEMENT_ID_PREFIX = 'gear-floating-limb';

// Camadas renderizáveis dos quatro membros e extremidades.
// As camadas 9, 10 e 14 pertencem ao rosto/corpo e são preservadas.
const LIMB_LAYER_INDICES = new Set([
  11, 13, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31,
]);

const EYE_MAX_X = 4.8;
const EYE_MAX_Y = 4.6;
const EYE_REACTION_RADIUS = 1.35;
const EYE_SMOOTHING = 0.18;

// O botão continua com 236 px para clique e renderização,
// mas o hover feliz usa uma área central um pouco menor.
const HAPPY_HOVER_SIZE = '86%';
const FLOATING_HOVER_SIZE = '36%';
const FLOATING_LOTTIE_CANVAS_SIZE = 220;
const HOVER_ANGER_DELAY_MS = 8_000;
const MISSED_CLICK_LIMIT = 3;
const FRUSTRATION_ANGER_DURATION_MS = 5_000;

// Calibração visual dos ícones animados do menu.
const MENU_LOTTIE_ICON_SIZE = 56;
const UPLOAD_LOTTIE_SCALE = 1.35;
const LOGOUT_LOTTIE_SCALE = 1.1;

// Nos 8 últimos frames, a expressão feliz começa a voltar para a normal.
// Enquanto houver hover, seguramos o quadro imediatamente anterior à transição.
const EXPRESSION_TRANSITION_FRAMES = 8;

interface QuickActionsMenuProps {
  onLogout: () => void;
}

interface GearMarker {
  tm: number;
  cm: string;
  dr: number;
}

interface GearShape {
  ty?: string;
  ln?: string;
}

interface GearLayer {
  ind?: number;
  shapes?: GearShape[];
}

interface GearAnimationData {
  fr?: number;
  markers?: GearMarker[];
  layers?: GearLayer[];
}

interface GearTimeline {
  fps: number;
  blockFrames: number;
  expressionStarts: [number, number, number];
}

interface EyeOffset {
  x: number;
  y: number;
}

type InteractionExpression =
  | 'automatic'
  | 'happy'
  | 'angry';

function prepareInteractiveGear(source: unknown): {
  animationData: GearAnimationData;
  timeline: GearTimeline;
} {
  const animationData = JSON.parse(
    JSON.stringify(source),
  ) as GearAnimationData;

  function identifyEyeLayer(
    layerIndex: number,
    elementId: string,
  ) {
    const layer = animationData.layers?.find(
      (candidate) => candidate.ind === layerIndex,
    );

    const rootShapeGroup = layer?.shapes?.find(
      (shape) => shape.ty === 'gr',
    );

    if (rootShapeGroup) {
      rootShapeGroup.ln = elementId;
    }
  }

  // Camadas 4 e 5 são os dois olhos do Fun Gear.
  identifyEyeLayer(4, LEFT_EYE_ID);
  identifyEyeLayer(5, RIGHT_EYE_ID);

  animationData.layers?.forEach((layer) => {
    if (
      layer.ind === undefined ||
      !LIMB_LAYER_INDICES.has(layer.ind)
    ) {
      return;
    }

    layer.shapes?.forEach((shape, shapeIndex) => {
      if (shape.ty === 'gr') {
        shape.ln =
          `${LIMB_ELEMENT_ID_PREFIX}-` +
          `${layer.ind}-${shapeIndex}`;
      }
    });
  });

  const markers = animationData.markers ?? [];

  const normalMarker = markers.find(
    (marker) => marker.cm === 'EXP_NORMAL',
  );
  const impatientMarker = markers.find(
    (marker) =>
      marker.cm === 'EXP_IMPACIENTE_BRABO',
  );
  const happyMarker = markers.find(
    (marker) => marker.cm === 'EXP_FELIZ',
  );

  const blockFrames = normalMarker?.dr ?? 720;

  return {
    animationData,
    timeline: {
      fps: animationData.fr ?? 60,
      blockFrames,
      expressionStarts: [
        normalMarker?.tm ?? 0,
        impatientMarker?.tm ?? blockFrames,
        happyMarker?.tm ?? blockFrames * 2,
      ],
    },
  };
}

export function QuickActionsMenu({
  onLogout,
}: QuickActionsMenuProps) {
  const [anchorEl, setAnchorEl] =
    useState<HTMLElement | null>(null);

  const [uploadOpen, setUploadOpen] =
    useState(false);

  const [isPastFilterBar, setIsPastFilterBar] =
    useState(false);

  const [floatingDismissed, setFloatingDismissed] =
    useState(false);

  const filterBarAnchorRef =
    useRef<HTMLDivElement | null>(null);

  const lottieRef =
    useRef<LottieRefCurrentProps | null>(null);

  const lottieHostRef =
    useRef<HTMLDivElement | null>(null);

  const eyeElementsRef =
    useRef<SVGGraphicsElement[]>([]);

  const limbElementsRef =
    useRef<SVGGraphicsElement[]>([]);

  const isFloatingRef = useRef(false);

  const targetEyeOffsetRef =
    useRef<EyeOffset>({ x: 0, y: 0 });

  const currentEyeOffsetRef =
    useRef<EyeOffset>({ x: 0, y: 0 });

  const hoveringGearRef = useRef(false);

  const clickedDuringHoverRef = useRef(false);

  const missedClicksRef = useRef(0);

  const interactionExpressionRef =
    useRef<InteractionExpression>('automatic');

  const hoverAngerTimerRef =
    useRef<number | null>(null);

  const frustrationAngerTimerRef =
    useRef<number | null>(null);

  const { animationData, timeline } = useMemo(
    () => prepareInteractiveGear(gearAnimation),
    [],
  );

  const menuOpen = Boolean(anchorEl);
  const isFloating =
    isPastFilterBar && !floatingDismissed;
  const showQuickActions =
    !isPastFilterBar || !floatingDismissed;

  function clearHoverAngerTimer() {
    if (hoverAngerTimerRef.current === null) {
      return;
    }

    window.clearTimeout(
      hoverAngerTimerRef.current,
    );
    hoverAngerTimerRef.current = null;
  }

  function clearFrustrationAngerTimer() {
    if (
      frustrationAngerTimerRef.current === null
    ) {
      return;
    }

    window.clearTimeout(
      frustrationAngerTimerRef.current,
    );
    frustrationAngerTimerRef.current = null;
  }

  function startHoverAngerCountdown() {
    clearHoverAngerTimer();

    hoverAngerTimerRef.current =
      window.setTimeout(() => {
        hoverAngerTimerRef.current = null;

        if (
          !hoveringGearRef.current ||
          clickedDuringHoverRef.current
        ) {
          return;
        }

        interactionExpressionRef.current =
          'angry';
        missedClicksRef.current = 0;
      }, HOVER_ANGER_DELAY_MS);
  }

  function triggerFrustrationAnger() {
    clearHoverAngerTimer();
    clearFrustrationAngerTimer();

    missedClicksRef.current = 0;
    interactionExpressionRef.current = 'angry';

    frustrationAngerTimerRef.current =
      window.setTimeout(() => {
        frustrationAngerTimerRef.current = null;

        if (hoveringGearRef.current) {
          clickedDuringHoverRef.current = false;
          interactionExpressionRef.current =
            'happy';
          startHoverAngerCountdown();
          return;
        }

        interactionExpressionRef.current =
          'automatic';
      }, FRUSTRATION_ANGER_DURATION_MS);
  }

  function handleGearPointerEnter(
    pointerType: string,
  ) {
    if (
      pointerType !== 'mouse' &&
      pointerType !== 'pen'
    ) {
      return;
    }

    hoveringGearRef.current = true;
    clickedDuringHoverRef.current = false;

    // Se ele já ficou bravo pelas três provocações,
    // permanece bravo até terminar essa reação.
    if (
      frustrationAngerTimerRef.current !== null
    ) {
      return;
    }

    interactionExpressionRef.current = 'happy';
    startHoverAngerCountdown();
  }

  function handleGearPointerLeave() {
    if (!hoveringGearRef.current) {
      return;
    }

    hoveringGearRef.current = false;
    clearHoverAngerTimer();

    const clicked = clickedDuringHoverRef.current;
    clickedDuringHoverRef.current = false;

    if (
      frustrationAngerTimerRef.current !== null
    ) {
      return;
    }

    if (clicked) {
      missedClicksRef.current = 0;
      interactionExpressionRef.current =
        'automatic';
      return;
    }

    // Depois de 8 segundos ele já demonstrou a irritação;
    // ao sair, reinicia a brincadeira do zero.
    if (
      interactionExpressionRef.current === 'angry'
    ) {
      missedClicksRef.current = 0;
      interactionExpressionRef.current =
        'automatic';
      return;
    }

    missedClicksRef.current += 1;

    if (
      missedClicksRef.current >=
      MISSED_CLICK_LIMIT
    ) {
      triggerFrustrationAnger();
      return;
    }

    interactionExpressionRef.current =
      'automatic';
  }

  function registerButtonClick() {
    clickedDuringHoverRef.current = true;
    missedClicksRef.current = 0;

    clearHoverAngerTimer();
    clearFrustrationAngerTimer();

    interactionExpressionRef.current =
      hoveringGearRef.current
        ? 'happy'
        : 'automatic';
  }

  const handleLottieDOMLoaded = useCallback(() => {
    const container =
      lottieRef.current?.animationContainerRef.current;

    if (!container) return;

    const eyeElements = [
      container.querySelector<SVGGraphicsElement>(
        `#${LEFT_EYE_ID}`,
      ),
      container.querySelector<SVGGraphicsElement>(
        `#${RIGHT_EYE_ID}`,
      ),
    ].filter(
      (
        element,
      ): element is SVGGraphicsElement =>
        element !== null,
    );

    eyeElements.forEach((element) => {
      element.style.transformBox = 'fill-box';
      element.style.transformOrigin = 'center';
      element.style.willChange = 'transform';
    });

    eyeElementsRef.current = eyeElements;

    const limbElements = Array.from(
      container.querySelectorAll<SVGGraphicsElement>(
        `[id^="${LIMB_ELEMENT_ID_PREFIX}-"]`,
      ),
    );

    limbElements.forEach((element) => {
      element.style.display =
        isFloatingRef.current ? 'none' : '';
    });

    limbElementsRef.current = limbElements;
  }, []);

  useEffect(() => {
    const anchor = filterBarAnchorRef.current;

    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const hasPassedFilterBar =
          !entry.isIntersecting &&
          entry.boundingClientRect.bottom <= 0;

        setIsPastFilterBar(hasPassedFilterBar);

        if (!hasPassedFilterBar) {
          setFloatingDismissed(false);
        }
      },
      { threshold: 0 },
    );

    observer.observe(anchor);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    isFloatingRef.current = isFloating;

    hoveringGearRef.current = false;
    clickedDuringHoverRef.current = false;
    missedClicksRef.current = 0;
    interactionExpressionRef.current =
      'automatic';
    targetEyeOffsetRef.current = { x: 0, y: 0 };

    if (hoverAngerTimerRef.current !== null) {
      window.clearTimeout(
        hoverAngerTimerRef.current,
      );
      hoverAngerTimerRef.current = null;
    }

    if (
      frustrationAngerTimerRef.current !== null
    ) {
      window.clearTimeout(
        frustrationAngerTimerRef.current,
      );
      frustrationAngerTimerRef.current = null;
    }

    limbElementsRef.current.forEach((element) => {
      element.style.display =
        isFloating ? 'none' : '';
    });

    // Evita que um menu aberto fique preso na posição
    // anterior durante a mudança para/de flutuante.
    setAnchorEl(null);
  }, [isFloating]);

  useEffect(() => {
    function resetEyeTarget() {
      targetEyeOffsetRef.current = {
        x: 0,
        y: 0,
      };
    }

    function resetPointerInteraction() {
      resetEyeTarget();
      hoveringGearRef.current = false;
      clickedDuringHoverRef.current = false;
      missedClicksRef.current = 0;
      interactionExpressionRef.current =
        'automatic';

      if (hoverAngerTimerRef.current !== null) {
        window.clearTimeout(
          hoverAngerTimerRef.current,
        );
        hoverAngerTimerRef.current = null;
      }

      if (
        frustrationAngerTimerRef.current !== null
      ) {
        window.clearTimeout(
          frustrationAngerTimerRef.current,
        );
        frustrationAngerTimerRef.current = null;
      }
    }

    function handlePointerMove(event: PointerEvent) {
      if (
        event.pointerType !== 'mouse' &&
        event.pointerType !== 'pen'
      ) {
        return;
      }

      const host = lottieHostRef.current;

      if (!host) {
        resetPointerInteraction();
        return;
      }

      const rect = host.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);

      const reactionRadius =
        Math.max(rect.width, rect.height) *
        EYE_REACTION_RADIUS;

      if (distance > reactionRadius) {
        resetEyeTarget();
        return;
      }

      const safeDistance = Math.max(distance, 0.001);

      const strength = Math.min(
        distance /
          (Math.min(rect.width, rect.height) * 0.55),
        1,
      );

      targetEyeOffsetRef.current = {
        x:
          (deltaX / safeDistance) *
          EYE_MAX_X *
          strength,
        y:
          (deltaY / safeDistance) *
          EYE_MAX_Y *
          strength,
      };
    }

    window.addEventListener(
      'pointermove',
      handlePointerMove,
      { passive: true },
    );
    window.addEventListener(
      'blur',
      resetPointerInteraction,
    );

    return () => {
      resetPointerInteraction();

      window.removeEventListener(
        'pointermove',
        handlePointerMove,
      );
      window.removeEventListener(
        'blur',
        resetPointerInteraction,
      );
    };
  }, []);

  useEffect(() => {
    let animationFrameId = 0;
    let timelineStartedAt: number | null = null;

    const expressionCount =
      timeline.expressionStarts.length;

    const automaticTimelineFrames =
      timeline.blockFrames * expressionCount;

    function renderFrame(now: number) {
      const lottie = lottieRef.current;

      if (lottie?.animationLoaded) {
        if (timelineStartedAt === null) {
          timelineStartedAt = now;
        }

        const elapsedFrames =
          ((now - timelineStartedAt) / 1000) *
          timeline.fps;

        const automaticFrame =
          elapsedFrames % automaticTimelineFrames;

        const automaticExpressionIndex = Math.min(
          expressionCount - 1,
          Math.floor(
            automaticFrame / timeline.blockFrames,
          ),
        );

        const blockPhase =
          automaticFrame % timeline.blockFrames;

        const interactionExpression =
          interactionExpressionRef.current;

        const renderedExpressionIndex =
          interactionExpression === 'happy'
            ? 2
            : interactionExpression === 'angry'
              ? 1
              : automaticExpressionIndex;

        const expressionStart =
          timeline.expressionStarts[
            renderedExpressionIndex
          ];

        const maximumHappyPhase = Math.max(
          0,
          timeline.blockFrames -
            EXPRESSION_TRANSITION_FRAMES -
            0.01,
        );

        const renderedPhase =
          interactionExpression !== 'automatic'
            ? Math.min(
                blockPhase,
                maximumHappyPhase,
              )
            : blockPhase;

        // Mantém a mesma fase dos pés e força somente
        // o bloco facial pedido pela interação.
        lottie.goToAndStop(
          expressionStart + renderedPhase,
          true,
        );
      }

      const current = currentEyeOffsetRef.current;
      const target = targetEyeOffsetRef.current;

      current.x +=
        (target.x - current.x) * EYE_SMOOTHING;
      current.y +=
        (target.y - current.y) * EYE_SMOOTHING;

      if (Math.abs(target.x - current.x) < 0.01) {
        current.x = target.x;
      }

      if (Math.abs(target.y - current.y) < 0.01) {
        current.y = target.y;
      }

      const eyeTransform =
        `translate(${current.x.toFixed(2)}px, ` +
        `${current.y.toFixed(2)}px)`;

      eyeElementsRef.current.forEach((element) => {
        element.style.transform = eyeTransform;
      });

      animationFrameId =
        window.requestAnimationFrame(renderFrame);
    }

    animationFrameId =
      window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(animationFrameId);

      eyeElementsRef.current.forEach((element) => {
        element.style.transform = '';
        element.style.willChange = '';
      });

      limbElementsRef.current.forEach((element) => {
        element.style.display = '';
      });
    };
  }, [timeline]);

  function handleOpenMenu(
    event: MouseEvent<HTMLElement>,
  ) {
    registerButtonClick();
    setAnchorEl(event.currentTarget);
  }

  function handleCloseMenu() {
    setAnchorEl(null);
  }

  function handleSelectUpload() {
    handleCloseMenu();
    setUploadOpen(true);
  }

  function handleSelectLogout() {
    handleCloseMenu();
    onLogout();
  }

  function handleCloseUpload() {
    setUploadOpen(false);
  }

  function handleDismissFloatingButton(
    event: MouseEvent<HTMLElement>,
  ) {
    event.stopPropagation();

    hoveringGearRef.current = false;
    clickedDuringHoverRef.current = false;
    missedClicksRef.current = 0;
    interactionExpressionRef.current =
      'automatic';

    clearHoverAngerTimer();
    clearFrustrationAngerTimer();
    handleCloseMenu();
    setFloatingDismissed(true);
  }

  return (
    <>
      <Box
        ref={filterBarAnchorRef}
        sx={{
          position: 'relative',
          width: { xs: 52, sm: 58 },
          height: { xs: 52, sm: 58 },
          mr: { xs: 1, sm: 2.7 },
          flexShrink: 0,
        }}
      >
        {showQuickActions && (
          <Portal disablePortal={!isFloating}>
            <Box
              sx={{
                position: isFloating
                  ? 'fixed'
                  : 'relative',
                right: isFloating
                  ? { xs: 16, sm: 28 }
                  : 'auto',
                top: isFloating
                  ? { xs: 16, sm: 24 }
                  : 'auto',
                zIndex: isFloating ? 1200 : 'auto',
                width: isFloating
                  ? { xs: 72, sm: 80 }
                  : '100%',
                height: isFloating
                  ? { xs: 72, sm: 80 }
                  : '100%',
                animation: isFloating
                  ? 'quickActionsFloatIn 260ms cubic-bezier(0.2, 0.8, 0.2, 1)'
                  : 'none',

                '@keyframes quickActionsFloatIn': {
                  from: {
                    opacity: 0,
                    transform:
                      'translateY(-14px) scale(0.86)',
                  },
                  to: {
                    opacity: 1,
                    transform:
                      'translateY(0) scale(1)',
                  },
                },
              }}
            >
              {isFloating && (
                <Tooltip
                  title="Ocultar botão flutuante"
                  placement="left"
                  arrow
                >
                  <IconButton
                    onClick={
                      handleDismissFloatingButton
                    }
                    aria-label="Ocultar ações rápidas"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      zIndex: 4,
                      width: 25,
                      height: 25,
                      p: 0,
                      color:
                        'rgba(15, 23, 42, 0.58)',
                      backgroundColor:
                        'rgba(255, 255, 255, 0.68)',
                      border:
                        '1px solid rgba(15, 23, 42, 0.20)',
                      boxShadow:
                        '0 2px 8px rgba(15, 23, 42, 0.10)',
                      backdropFilter: 'blur(6px)',
                      transition:
                        'background-color 160ms ease, ' +
                        'border-color 160ms ease, ' +
                        'transform 160ms ease',

                      '&:hover': {
                        color:
                          'rgba(15, 23, 42, 0.78)',
                        backgroundColor:
                          'rgba(255, 255, 255, 0.92)',
                        borderColor:
                          'rgba(15, 23, 42, 0.32)',
                        transform: 'scale(1.06)',
                      },
                    }}
                  >
                    <CloseRoundedIcon
                      sx={{ fontSize: 16 }}
                    />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip
                title="Ações rápidas"
                placement={
                  isFloating ? 'left' : 'bottom'
                }
                arrow
              >
                <IconButton
                  disableRipple
                  onClick={handleOpenMenu}
                  aria-label="Abrir ações rápidas"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    zIndex: 2,

                  width: isFloating
                    ? { xs: 72, sm: 80 }
                    : { xs: 210, sm: 236 },
                  height: isFloating
                    ? { xs: 72, sm: 80 }
                    : { xs: 130, sm: 150 },

                    p: 0,
                    overflow: 'visible',
                    borderRadius: '50%',
                    backgroundColor: isFloating
                      ? 'rgba(255, 255, 255, 0.94)'
                      : 'transparent',
                    border: isFloating
                      ? '1px solid rgba(148, 163, 184, 0.24)'
                      : '1px solid transparent',
                    boxShadow: isFloating
                      ? '0 14px 34px rgba(15, 23, 42, 0.22)'
                      : 'none',
                    backdropFilter: isFloating
                      ? 'blur(8px)'
                      : 'none',

                    transform:
                      'translate(-50%, -50%)',
                    transition:
                      'transform 180ms ease, ' +
                      'background-color 180ms ease, ' +
                      'box-shadow 180ms ease',

                    '&:hover': {
                      backgroundColor: isFloating
                        ? '#ffffff'
                        : 'transparent',
                      boxShadow: isFloating
                        ? '0 18px 40px rgba(15, 23, 42, 0.28)'
                        : 'none',
                      transform:
                        'translate(-50%, -50%) scale(1.08)',
                    },
                  }}
                >
                  <Box
                    ref={lottieHostRef}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: isFloating
                        ? FLOATING_LOTTIE_CANVAS_SIZE
                        : '100%',
                      height: isFloating
                        ? FLOATING_LOTTIE_CANVAS_SIZE
                        : '100%',
                      transform:
                        'translate(-50%, -50%)',
                      pointerEvents: 'none',
                    }}
                  >
                    <Lottie
                      lottieRef={lottieRef}
                      animationData={animationData}
                      renderer="svg"
                      autoplay={false}
                      loop={false}
                      onDOMLoaded={handleLottieDOMLoaded}
                      style={{
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                      }}
                    />

                    <Box
                      aria-hidden="true"
                      onPointerEnter={(event) => {
                        handleGearPointerEnter(
                          event.pointerType,
                        );
                      }}
                      onPointerLeave={
                        handleGearPointerLeave
                      }
                      onPointerCancel={
                        handleGearPointerLeave
                      }
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        zIndex: 1,
                        width: isFloating
                          ? FLOATING_HOVER_SIZE
                          : HAPPY_HOVER_SIZE,
                        height: isFloating
                          ? FLOATING_HOVER_SIZE
                          : HAPPY_HOVER_SIZE,
                        borderRadius: '50%',
                        transform:
                          'translate(-50%, -50%)',
                        pointerEvents: 'auto',
                        cursor: 'pointer',
                      }}
                    />
                  </Box>
                </IconButton>
              </Tooltip>
            </Box>
          </Portal>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        disableScrollLock
        marginThreshold={12}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: {
                xs: 'calc(100vw - 24px)',
                sm: 304,
              },
              minWidth: 0,
              maxWidth: 'calc(100vw - 24px)',
              boxSizing: 'border-box',

              borderRadius: 2.5,

              border:
                '1px solid rgba(148, 163, 184, 0.16)',

              boxShadow:
                '0 16px 36px rgba(15, 23, 42, 0.18), ' +
                '0 4px 12px rgba(15, 23, 42, 0.08)',
            },
          },
        }}
      >
        <MenuItem
          onClick={handleSelectUpload}
          sx={{
            py: 1.35,
            px: { xs: 1.5, sm: 2 },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth:
                MENU_LOTTIE_ICON_SIZE + 12,
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                width: MENU_LOTTIE_ICON_SIZE,
                height: MENU_LOTTIE_ICON_SIZE,
                flexShrink: 0,
              }}
            >
              <Lottie
                animationData={uploadAnimation}
                autoplay
                loop
                renderer="svg"
                style={{
                  width: '100%',
                  height: '100%',
                  transform: `scale(${UPLOAD_LOTTIE_SCALE})`,
                  transformOrigin: 'center',
                }}
              />
            </Box>
          </ListItemIcon>

          <ListItemText
            primary={
              <Typography
                sx={{
                  color: '#0f172a',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                }}
              >
                Importar mão de obra
              </Typography>
            }
            secondary={
              <Typography
                sx={{
                  color: '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 550,
                }}
              >
                Upload de planilha XLSX
              </Typography>
            }
          />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={handleSelectLogout}
          sx={{
            py: 1.35,
            px: { xs: 1.5, sm: 2 },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth:
                MENU_LOTTIE_ICON_SIZE + 12,
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                width: MENU_LOTTIE_ICON_SIZE,
                height: MENU_LOTTIE_ICON_SIZE,
                flexShrink: 0,
              }}
            >
              <Lottie
                animationData={logoutAnimation}
                autoplay
                loop
                renderer="svg"
                style={{
                  width: '100%',
                  height: '100%',
                  transform: `scale(${LOGOUT_LOTTIE_SCALE})`,
                  transformOrigin: 'center',
                }}
              />
            </Box>
          </ListItemIcon>

          <ListItemText
            primary={
              <Typography
                sx={{
                  color: '#0f172a',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                }}
              >
                Sair
              </Typography>
            }
            secondary={
              <Typography
                sx={{
                  color: '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 550,
                }}
              >
                Encerrar sessão
              </Typography>
            }
          />
        </MenuItem>
      </Menu>

      <Dialog
        open={uploadOpen}
        onClose={handleCloseUpload}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: {
                xs: 4,
                md: 5,
              },

              overflow: 'hidden',

              backgroundColor: 'transparent',
              backgroundImage: 'none',
              boxShadow: 'none',
            },
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: 'relative',
          }}
        >
          <IconButton
            onClick={handleCloseUpload}
            aria-label="Fechar"
            sx={{
              position: 'absolute',
              top: 14,
              right: 14,
              zIndex: 2,

              color: '#ffffff',

              backgroundColor:
                'rgba(255, 255, 255, 0.10)',

              border:
                '1px solid rgba(255, 255, 255, 0.16)',

              '&:hover': {
                backgroundColor:
                  'rgba(255, 255, 255, 0.18)',
              },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>

          <ImportacaoMaoObraSection />
        </DialogContent>
      </Dialog>
    </>
  );
}