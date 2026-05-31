// ============================================================================
// WORK-PRO TODOS — Stili condivisi
// Palette ispirata all'app esistente noi.todos.it (rosso scuro / bianco)
// ============================================================================

export const WP_COLORS = {
  primary:       '#A82238', // rosso Todos
  primaryDark:   '#7d1a2a',
  primaryLight:  '#fce4e8',
  bg:            '#ffffff',
  bgAlt:         '#f8fafc',
  border:        '#e2e8f0',
  text:          '#1e293b',
  textMuted:     '#64748b',
  success:       '#16a34a',
  successLight:  '#dcfce7',
  warning:       '#eab308',
  warningLight:  '#fef9c3',
  danger:        '#dc2626',
  dangerLight:   '#fee2e2',
  info:          '#0ea5e9',
  blueSite:      '#1d4ed8' // codice cantiere manutenzione in blu
}

export const wpButton = (variant = 'primary', size = 'md') => {
  const base = {
    border: 'none',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit'
  }
  const sizes = {
    sm: { padding: '6px 10px', fontSize: '0.75rem' },
    md: { padding: '10px 16px', fontSize: '0.85rem' },
    lg: { padding: '16px 24px', fontSize: '1rem' },
    xl: { padding: '24px 32px', fontSize: '1.2rem', letterSpacing: '0.02em' }
  }
  const variants = {
    primary:   { background: WP_COLORS.primary, color: 'white' },
    secondary: { background: 'white', color: WP_COLORS.primary, border: `1.5px solid ${WP_COLORS.primary}` },
    ghost:     { background: 'transparent', color: WP_COLORS.text, border: `1px solid ${WP_COLORS.border}` },
    danger:    { background: WP_COLORS.danger, color: 'white' },
    success:   { background: WP_COLORS.success, color: 'white' }
  }
  return { ...base, ...sizes[size], ...variants[variant] }
}

export const wpCard = {
  background: 'white',
  border: `1px solid ${WP_COLORS.border}`,
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
}

export const wpTileButton = {
  background: WP_COLORS.primary,
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  padding: '28px 20px',
  fontSize: '1.05rem',
  fontWeight: 800,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  textAlign: 'center',
  boxShadow: '0 4px 14px rgba(168, 34, 56, 0.25)',
  transition: 'all 0.15s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  minHeight: '120px'
}

export const wpTableHeader = {
  background: WP_COLORS.primary,
  color: 'white',
  fontWeight: 700,
  textTransform: 'uppercase',
  fontSize: '0.72rem',
  letterSpacing: '0.05em',
  padding: '10px 12px',
  textAlign: 'left'
}

export const wpInput = {
  width: '100%',
  padding: '10px 12px',
  border: `1.5px solid ${WP_COLORS.primary}`,
  borderRadius: '8px',
  fontSize: '0.9rem',
  color: WP_COLORS.text,
  background: 'white',
  fontFamily: 'inherit',
  outline: 'none'
}

export const wpLabel = {
  color: WP_COLORS.primary,
  fontWeight: 700,
  fontSize: '1.05rem',
  display: 'block',
  marginBottom: '6px'
}

export const wpSectionTitle = {
  color: WP_COLORS.text,
  fontWeight: 800,
  fontStyle: 'italic',
  fontSize: '1.35rem',
  marginBottom: '16px'
}

export const wpBadge = (bg, color = 'white') => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  background: bg,
  color: color,
  fontSize: '0.68rem',
  fontWeight: 800,
  borderRadius: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
})

// CSS keyframes da iniettare una volta
export const WP_GLOBAL_CSS = `
@keyframes wp-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
@keyframes wp-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 14px rgba(168, 34, 56, 0.25); }
  50% { transform: scale(1.02); box-shadow: 0 6px 20px rgba(168, 34, 56, 0.4); }
}
.wp-tile:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(168, 34, 56, 0.35); }
.wp-blink { animation: wp-blink 1.2s ease-in-out infinite; }
.wp-row:hover { background: #fafafa; }
.wp-row-strip:nth-child(even) { background: #f8fafc; }
.wp-link { color: ${WP_COLORS.primary}; cursor: pointer; text-decoration: none; }
.wp-link:hover { text-decoration: underline; }
`
