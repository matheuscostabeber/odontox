import { useState, useCallback } from 'react'

// Hook simples de formulário controlado.
// const { form, field, set } = useForm(inicial);
// <input {...field('nome')} />
export function useForm<T extends Record<string, unknown>>(initial: T) {
  const [form, setForm] = useState<T>(initial)

  const set = useCallback(<K extends keyof T>(k: K, v: T[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
  }, [])

  const field = useCallback(
    <K extends keyof T>(k: K) => ({
      value: (form[k] ?? '') as T[K] | '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | T[K]) => {
        const next =
          e && typeof e === 'object' && 'target' in e
            ? ((e as React.ChangeEvent<HTMLInputElement>).target.value as unknown as T[K])
            : (e as T[K])
        set(k, next)
      },
    }),
    [form, set]
  )

  return { form, set, field, setForm }
}
