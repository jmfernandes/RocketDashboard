interface AlertBannerProps {
  type: 'danger' | 'success'
  message: string | null
}

export default function AlertBanner({ type, message }: AlertBannerProps) {
  if (!message) return null

  const icon = type === 'danger' ? 'fa-exclamation-triangle' : 'fa-check-circle'

  return (
    <div className={`alert alert-${type}`} role="alert">
      <i className={`fas ${icon} me-2`}></i>
      {message}
    </div>
  )
}
