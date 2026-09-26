import { useState, type ChangeEvent, type FocusEvent } from 'react'

type FormValues = { name: string; email: string; message: string }
type FormErrors = Partial<Record<keyof FormValues, string>>
type Touched = Record<keyof FormValues, boolean>

const INITIAL_VALUES: FormValues = { name: '', email: '', message: '' }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.name.trim()) errors.name = '请输入你的姓名'
  if (!values.email.trim()) errors.email = '请输入邮箱地址'
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = '请输入有效的邮箱地址'
  if (!values.message.trim()) errors.message = '请写点留言内容吧'
  return errors
}

export default function Contact() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [touched, setTouched] = useState<Touched>({ name: false, email: false, message: false })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const errors = validate(values)
  const isValid = Object.keys(errors).length === 0
  const visibleErrors: FormErrors = {
    name: touched.name ? errors.name : undefined,
    email: touched.email ? errors.email : undefined,
    message: touched.message ? errors.message : undefined,
  }

  const handleChange = (field: keyof FormValues) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleBlur = (field: keyof FormValues) => (_e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (!isValid || submitting) return
    // 无后端：仅模拟发送过程与成功反馈
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 900)
  }

  const handleReset = () => {
    setValues(INITIAL_VALUES)
    setTouched({ name: false, email: false, message: false })
    setSubmitted(false)
  }

  return (
    <div className="section-wrap contact-page">
      <header className="page-head">
        <p className="eyebrow">Contact</p>
        <h1>联系</h1>
        <p className="page-lede">
          肖像委托、作品出版、展览借展或只是想聊聊某张照片——都欢迎来信。
        </p>
      </header>

      <div className="contact-grid">
        <aside className="contact-aside">
          <section>
            <h2>来信流程</h2>
            <ol className="contact-steps">
              <li>
                <span className="guide-no">01</span>
                <p>填写姓名、邮箱与留言，说明合作类型与期望的时间。</p>
              </li>
              <li>
                <span className="guide-no">02</span>
                <p>发送后通常会在五个工作日内收到回复，附上下一步沟通方式。</p>
              </li>
              <li>
                <span className="guide-no">03</span>
                <p>肖像委托会先安排一次简短通话；出版与展览则以邮件确认细节。</p>
              </li>
            </ol>
          </section>
          <section className="contact-meta">
            <h2>其他方式</h2>
            <p>
              邮箱：<a href="mailto:studio@linbai-photo.com">studio@linbai-photo.com</a>
            </p>
            <p>工作地点：成都 · 高原项目期常驻川西</p>
          </section>
        </aside>

        <div className="contact-form-wrap">
          {submitted ? (
            <div className="form-success" role="status">
              <span className="success-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" /></svg>
              </span>
              <h2>谢谢你的来信</h2>
              <p>
                消息已经记下，{values.name.trim()}。我会在五个工作日内回复至
                <strong> {values.email.trim()}</strong>，请留意邮箱。
              </p>
              <button type="button" className="btn-ghost" onClick={handleReset}>
                再写一封
              </button>
            </div>
          ) : (
            <form className="contact-form" noValidate onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="name">姓名</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={handleChange('name')}
                  onBlur={handleBlur('name')}
                  aria-invalid={Boolean(visibleErrors.name)}
                  aria-describedby={visibleErrors.name ? 'name-error' : undefined}
                />
                {visibleErrors.name && (
                  <p className="field-error" id="name-error" role="alert">
                    {visibleErrors.name}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="email">邮箱</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  aria-invalid={Boolean(visibleErrors.email)}
                  aria-describedby={visibleErrors.email ? 'email-error' : undefined}
                />
                {visibleErrors.email && (
                  <p className="field-error" id="email-error" role="alert">
                    {visibleErrors.email}
                  </p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="message">留言</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={values.message}
                  onChange={handleChange('message')}
                  onBlur={handleBlur('message')}
                  aria-invalid={Boolean(visibleErrors.message)}
                  aria-describedby={visibleErrors.message ? 'message-error' : undefined}
                />
                {visibleErrors.message && (
                  <p className="field-error" id="message-error" role="alert">
                    {visibleErrors.message}
                  </p>
                )}
              </div>

              <button type="submit" className="btn-primary" disabled={!isValid || submitting}>
                {submitting ? '发送中…' : '发送消息'}
              </button>
              {!isValid && (
                <p className="form-hint">所有字段填写无误后即可发送。</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
