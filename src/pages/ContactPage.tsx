import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

type Field = 'name' | 'email' | 'message'
type Status = 'idle' | 'sending' | 'sent'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MESSAGE_MIN_LENGTH = 10

function validate(values: Record<Field, string>): Record<Field, string | null> {
  return {
    name: values.name.trim() ? null : '请输入姓名',
    email: !values.email.trim()
      ? '请输入邮箱'
      : EMAIL_PATTERN.test(values.email.trim())
        ? null
        : '请输入有效的邮箱地址',
    message: !values.message.trim()
      ? '请输入留言'
      : values.message.trim().length < MESSAGE_MIN_LENGTH
        ? `留言至少需要 ${MESSAGE_MIN_LENGTH} 个字符`
        : null,
  }
}

export default function ContactPage() {
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', message: '' })
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    name: false,
    email: false,
    message: false,
  })
  const [status, setStatus] = useState<Status>('idle')

  const errors = useMemo(() => validate(values), [values])
  const isValid = !errors.name && !errors.email && !errors.message

  const setField = (field: Field) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues(current => ({ ...current, [field]: event.target.value }))
  }

  const blurField = (field: Field) => () => {
    setTouched(current => ({ ...current, [field]: true }))
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (!isValid || status === 'sending') return
    setStatus('sending')
    // Front-end only simulation — no real backend.
    window.setTimeout(() => setStatus('sent'), 900)
  }

  if (status === 'sent') {
    return (
      <div className="page contact-page">
        <div className="contact-success" role="status">
          <span className="success-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26">
              <path d="M4.5 12.5l5 5L19.5 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="eyebrow">发送成功</p>
          <h1>谢谢你的来信</h1>
          <p className="page-lede">消息已妥善收到，我们会尽快与你联系。</p>
          <Link to="/" className="text-link">
            返回首页 →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page contact-page">
      <header className="page-header contact-intro">
        <p className="eyebrow">联系</p>
        <h1>写下你的拍摄计划</h1>
        <p className="page-lede">
          无论是肖像拍摄、纪录项目或作品合作，都欢迎留下信息。通常会在两个工作日内回复。
        </p>
      </header>

      <form className="contact-form" onSubmit={onSubmit} noValidate>
        <div className={`field ${touched.name && errors.name ? 'field--invalid' : ''}`}>
          <label htmlFor="contact-name">姓名</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={setField('name')}
            onBlur={blurField('name')}
            aria-invalid={touched.name && Boolean(errors.name)}
          />
          {touched.name && errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className={`field ${touched.email && errors.email ? 'field--invalid' : ''}`}>
          <label htmlFor="contact-email">邮箱</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={setField('email')}
            onBlur={blurField('email')}
            aria-invalid={touched.email && Boolean(errors.email)}
          />
          {touched.email && errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className={`field ${touched.message && errors.message ? 'field--invalid' : ''}`}>
          <label htmlFor="contact-message">留言</label>
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            value={values.message}
            onChange={setField('message')}
            onBlur={blurField('message')}
            aria-invalid={touched.message && Boolean(errors.message)}
          />
          {touched.message && errors.message && <p className="field-error">{errors.message}</p>}
        </div>

        <button type="submit" className="submit-button" disabled={!isValid || status === 'sending'}>
          {status === 'sending' ? '发送中…' : '发送消息'}
        </button>
      </form>
    </div>
  )
}
