import { useState, useCallback } from 'react';

// Hook simples de formulário controlado.
// const { form, field, set } = useForm(inicial);
// <input {...field('nome')} />
export function useForm(initial) {
  const [form, setForm] = useState(initial);
  const set = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), []);
  const field = useCallback(
    (k) => ({
      value: form[k] ?? '',
      onChange: (e) => set(k, e && e.target ? e.target.value : e),
    }),
    [form, set]
  );
  return { form, set, field, setForm };
}
