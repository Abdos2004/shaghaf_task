import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, ArrowLeft, ChevronRight, Grid2X2, List, LoaderCircle, MessageCircle, Pencil, Phone, PhoneCall, Plus, Save, Search, Trash2, UsersRound, X } from 'lucide-react'
import './App.css'
import './CustomerDetails.css'
import './PhoneField.css'
import './Validation.css'
import './DeleteCustomer.css'
import './SearchResults.css'

type Customer = { id: string; firstName: string; lastName: string; phoneNumber: string; createdAtUtc: string }
type CustomerForm = Omit<Customer, 'id' | 'createdAtUtc'>
type ViewMode = 'cards' | 'list'

const emptyForm: CustomerForm = { firstName: '', lastName: '', phoneNumber: '' }
const apiBasePath = (import.meta.env.VITE_API_BASE_PATH || '/api').replace(/\/$/, '')
const toForm = (customer: Customer): CustomerForm => ({ firstName: customer.firstName, lastName: customer.lastName, phoneNumber: customer.phoneNumber })
const subscriberNumber = (phoneNumber: string) => phoneNumber.replace(/\D/g, '').replace(/^2/, '').slice(0, 11)
const withCountryCode = (value: string) => `+2${value.replace(/\D/g, '').slice(0, 11)}`
const isCustomerFormValid = (form: CustomerForm) => form.firstName.trim().length > 0 && form.lastName.trim().length > 0 && /^\+2\d{11}$/.test(form.phoneNumber)

function currentCustomerId() {
  const match = window.location.pathname.match(/^\/customers\/([0-9a-f-]{36})$/i)
  return match?.[1] ?? null
}

function App() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const createSubmissionInFlight = useRef(false)
  const [customerId, setCustomerId] = useState<string | null>(currentCustomerId)

  async function loadCustomers(searchTerm = search, signal?: AbortSignal) {
    setIsLoading(true)
    setLoadError('')
    try {
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.set('search', searchTerm.trim())
      const queryString = params.toString()
      const response = await fetch(`${apiBasePath}/users${queryString ? `?${queryString}` : ''}`, { signal })
      if (!response.ok) throw new Error('Unable to load customers.')
      setCustomers(await response.json() as Customer[])
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return
      setLoadError(requestError instanceof Error ? requestError.message : 'Unable to load customers.')
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void loadCustomers('', controller.signal)
    return () => controller.abort()
  }, [])
  useEffect(() => {
    const syncLocation = () => setCustomerId(currentCustomerId())
    window.addEventListener('popstate', syncLocation)
    return () => window.removeEventListener('popstate', syncLocation)
  }, [])

  function openCustomer(id: string) {
    window.history.pushState({}, '', `/customers/${id}`)
    setCustomerId(id)
  }

  function returnToDirectory() {
    window.history.pushState({}, '', '/')
    setCustomerId(null)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const searchTerm = search.trim()
    setAppliedSearch(searchTerm)
    void loadCustomers(searchTerm)
  }

  function clearSearch() {
    setSearch('')
    setAppliedSearch('')
    void loadCustomers('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving || createSubmissionInFlight.current || !isCustomerFormValid(form)) return

    createSubmissionInFlight.current = true
    setIsSaving(true)
    setFormError('')
    try {
      const response = await fetch(`${apiBasePath}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!response.ok) throw new Error(await responseMessage(response, 'Unable to add this customer.'))
      await response.json()
      setForm(emptyForm)
      setIsFormOpen(false)
      void loadCustomers(appliedSearch)
    } catch (requestError) {
      setFormError(requestError instanceof Error ? requestError.message : 'Unable to add this customer.')
    } finally {
      createSubmissionInFlight.current = false
      setIsSaving(false)
    }
  }

  if (customerId) {
    return <CustomerDetailsPage
      customerId={customerId}
      initialCustomer={customers.find((customer) => customer.id === customerId)}
      onBack={returnToDirectory}
      onUpdated={(updatedCustomer) => setCustomers((current) => current.map((customer) => customer.id === updatedCustomer.id ? updatedCustomer : customer))}
      onDeleted={(deletedCustomerId) => setCustomers((current) => current.filter((customer) => customer.id !== deletedCustomerId))}
    />
  }

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="Shaghafawy customers home"><img src="/shaghaf-logo.jpg" alt="Shaghafawy" /><span>Shaghafawy</span></a></header>
    <section className="customers-section" aria-labelledby="customers-title">
      <div className="section-heading"><div><p className="eyebrow">Directory</p><h2 id="customers-title">Your customers <span>{customers.length}</span></h2></div><button className="add-button" type="button" onClick={() => setIsFormOpen(true)}><Plus size={20} strokeWidth={2.8} /> Add new customer</button></div>
      <div className="directory-controls"><form className="search-box" role="search" onSubmit={handleSearch}><Search size={19} aria-hidden="true" /><label className="sr-only" htmlFor="customer-search">Search customers</label><input id="customer-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or phone number" /><button className="search-button" type="submit" disabled={isLoading} aria-label="Search customers"><Search size={18} /><span>Search</span></button></form><div className="view-switcher" role="group" aria-label="Customer view"><button className={viewMode === 'cards' ? 'active' : ''} type="button" onClick={() => setViewMode('cards')} aria-pressed={viewMode === 'cards'}><Grid2X2 size={18} /><span>Cards</span></button><button className={viewMode === 'list' ? 'active' : ''} type="button" onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'}><List size={19} /><span>List</span></button></div></div>
      {loadError ? <FailureState message={loadError} onRetry={() => void loadCustomers(appliedSearch)} /> : isLoading ? <LoadingState message={appliedSearch ? 'Searching customers…' : 'Loading your customers…'} /> : customers.length ? viewMode === 'cards' ? <div className="customer-grid">{customers.map((customer, index) => <CustomerCard customer={customer} key={customer.id} accentIndex={index} onView={openCustomer} />)}</div> : <CustomerList customers={customers} onView={openCustomer} /> : <EmptyState search={appliedSearch} onClear={clearSearch} onAdd={() => setIsFormOpen(true)} />}
    </section>
    {isFormOpen && <CustomerModal form={form} error={formError} isSaving={isSaving} onChange={setForm} onDismissError={() => setFormError('')} onClose={() => { setFormError(''); setIsFormOpen(false) }} onSubmit={handleSubmit} />}
  </main>
}

function CustomerDetailsPage({ customerId, initialCustomer, onBack, onUpdated, onDeleted }: { customerId: string; initialCustomer?: Customer; onBack: () => void; onUpdated: (customer: Customer) => void; onDeleted: (customerId: string) => void }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const saveSubmissionInFlight = useRef(false)
  const [error, setError] = useState('')
  const [showValidation, setShowValidation] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function loadCustomer() {
      setIsLoading(true)
      try {
        const response = await fetch(`${apiBasePath}/users/${customerId}`)
        if (!response.ok) throw new Error(response.status === 404 ? 'This customer could not be found.' : 'Unable to load this customer.')
        const loadedCustomer = await response.json() as Customer
        setCustomer(loadedCustomer)
        setForm(toForm(loadedCustomer))
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load this customer.')
      } finally {
        setIsLoading(false)
      }
    }
    void Promise.resolve().then(loadCustomer)
  }, [customerId])

  const displayedCustomer = customer ?? initialCustomer
  async function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving || saveSubmissionInFlight.current) return

    if (!isCustomerFormValid(form)) {
      setShowValidation(true)
      return
    }
    saveSubmissionInFlight.current = true
    setIsSaving(true)
    setError('')
    try {
      const response = await fetch(`${apiBasePath}/users/${customerId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!response.ok) throw new Error(await responseMessage(response, 'Unable to save this customer.'))
      const updatedCustomer = await response.json() as Customer
      setCustomer(updatedCustomer)
      setForm(toForm(updatedCustomer))
      setIsEditing(false)
      setShowValidation(false)
      onUpdated(updatedCustomer)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save this customer.')
    } finally {
      saveSubmissionInFlight.current = false
      setIsSaving(false)
    }
  }

  function cancelEdit() {
    if (displayedCustomer) setForm(toForm(displayedCustomer))
    setIsEditing(false)
    setError('')
    setShowValidation(false)
  }

  async function deleteCustomer() {
    setIsDeleting(true)
    setError('')
    try {
      const response = await fetch(`${apiBasePath}/users/${customerId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await responseMessage(response, 'Unable to delete this customer.'))
      onDeleted(customerId)
      onBack()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to delete this customer.')
      setIsDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="/" onClick={(event) => { event.preventDefault(); onBack() }} aria-label="Back to customers"><img src="/shaghaf-logo.jpg" alt="Shaghafawy" /><span>Shaghafawy</span></a></header>
    <section className="details-section" aria-labelledby="customer-details-title">
      <button className="back-button" type="button" onClick={onBack}><ArrowLeft size={18} /> All customers</button>
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
      {isLoading ? <LoadingState message="Loading customer details…" /> : displayedCustomer ? <div className="details-card">
        <div className="details-heading"><div className="details-identity"><div className="avatar details-avatar" aria-hidden="true">{`${displayedCustomer.firstName[0] ?? ''}${displayedCustomer.lastName[0] ?? ''}`.toUpperCase()}</div><div><p className="eyebrow">Customer profile</p><h1 id="customer-details-title">{displayedCustomer.firstName} {displayedCustomer.lastName}</h1></div></div>{!isEditing && <div className="details-actions"><button className="delete-button" type="button" onClick={() => setIsDeleteDialogOpen(true)}><Trash2 size={18} /> Delete</button><button className="add-button" type="button" onClick={() => { setShowValidation(false); setIsEditing(true) }}><Pencil size={18} /> Edit details</button></div>}</div>
        {isEditing ? <form className="details-form" onSubmit={saveCustomer}><div className="edit-form-intro"><span><Pencil size={17} /> Editing customer details</span><p>Changes are saved directly to this customer’s profile.</p></div><div className="form-row"><Field label="First name" value={form.firstName} invalid={showValidation && !form.firstName.trim()} onChange={(value) => { setShowValidation(true); setForm({ ...form, firstName: value }) }} /><Field label="Last name" value={form.lastName} invalid={showValidation && !form.lastName.trim()} onChange={(value) => { setShowValidation(true); setForm({ ...form, lastName: value }) }} /></div><PhoneField value={form.phoneNumber} invalid={showValidation && !/^\+2\d{11}$/.test(form.phoneNumber)} onChange={(value) => { setShowValidation(true); setForm({ ...form, phoneNumber: value }) }} /><div className="form-actions"><button className="cancel-button" type="button" disabled={isSaving} onClick={cancelEdit}>Cancel</button><button className="save-button" type="submit" disabled={isSaving || !isCustomerFormValid(form)}>{isSaving ? 'Saving…' : 'Save changes'} <Save size={17} /></button></div></form> : <dl className="details-list"><div><dt>First name</dt><dd>{displayedCustomer.firstName}</dd></div><div><dt>Last name</dt><dd>{displayedCustomer.lastName}</dd></div><div><dt>Phone number</dt><dd><div className="phone-actions"><a className="phone-number" href={`tel:${displayedCustomer.phoneNumber}`}><Phone size={17} /> {displayedCustomer.phoneNumber}</a><a className="contact-button call-button" href={`tel:${displayedCustomer.phoneNumber}`}><PhoneCall size={16} /> Call</a><a className="contact-button whatsapp-button" href={`https://wa.me/${displayedCustomer.phoneNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a></div></dd></div><div><dt>Customer since</dt><dd>{new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(displayedCustomer.createdAtUtc))}</dd></div></dl>}
      </div> : <div className="empty-state"><div className="empty-icon"><UsersRound size={34} /></div><h3>Customer not found</h3><p>This customer may have been removed.</p><button className="text-button" type="button" onClick={onBack}>Back to customers <ChevronRight size={18} /></button></div>}
    </section>
    {isDeleteDialogOpen && displayedCustomer && <DeleteConfirmation customer={displayedCustomer} isDeleting={isDeleting} onCancel={() => setIsDeleteDialogOpen(false)} onConfirm={() => void deleteCustomer()} />}
  </main>
}

function DeleteConfirmation({ customer, isDeleting, onCancel, onConfirm }: { customer: Customer; isDeleting: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={() => !isDeleting && onCancel()}><section className="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-customer-title" aria-describedby="delete-customer-description" onMouseDown={(event) => event.stopPropagation()}><div className="delete-icon"><Trash2 size={25} /></div><h2 id="delete-customer-title">Delete customer?</h2><p id="delete-customer-description">This will permanently remove <strong>{customer.firstName} {customer.lastName}</strong> from your customer directory. This action cannot be undone.</p><div className="delete-actions"><button className="cancel-button" type="button" onClick={onCancel} disabled={isDeleting}>Keep customer</button><button className="confirm-delete-button" type="button" onClick={onConfirm} disabled={isDeleting}><Trash2 size={17} /> {isDeleting ? 'Deleting…' : 'Delete customer'}</button></div></section></div>
}

function CustomerCard({ customer, accentIndex, onView }: { customer: Customer; accentIndex: number; onView: (id: string) => void }) {
  const initials = `${customer.firstName[0] ?? ''}${customer.lastName[0] ?? ''}`.toUpperCase()
  const joinedDate = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(customer.createdAtUtc))
  return <article className={`customer-card accent-${accentIndex % 4}`}><div className="card-topline"><div className="avatar" aria-hidden="true">{initials}</div><span className="joined">Joined {joinedDate}</span></div><h3>{customer.firstName} {customer.lastName}</h3><a className="phone-number" href={`tel:${customer.phoneNumber}`}><Phone size={16} /> {customer.phoneNumber}</a><button className="card-action" type="button" onClick={() => onView(customer.id)}>View customer <ChevronRight size={17} /></button></article>
}

function CustomerList({ customers, onView }: { customers: Customer[]; onView: (id: string) => void }) {
  return <div className="customer-list" role="list" aria-label="Customers"><div className="customer-list-head" aria-hidden="true"><span>Customer</span><span>Phone number</span><span>Joined</span><span /></div>{customers.map((customer) => { const initials = `${customer.firstName[0] ?? ''}${customer.lastName[0] ?? ''}`.toUpperCase(); const joinedDate = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(customer.createdAtUtc)); return <article className="customer-list-row" key={customer.id} role="listitem"><div className="list-customer"><div className="avatar" aria-hidden="true">{initials}</div><strong>{customer.firstName} {customer.lastName}</strong></div><a className="phone-number" href={`tel:${customer.phoneNumber}`}><Phone size={16} /> {customer.phoneNumber}</a><span className="list-joined">{joinedDate}</span><button className="list-action" type="button" onClick={() => onView(customer.id)}>View <ChevronRight size={17} /></button></article> })}</div>
}

function CustomerModal({ form, error, isSaving, onChange, onDismissError, onClose, onSubmit }: { form: CustomerForm; error: string; isSaving: boolean; onChange: (form: CustomerForm) => void; onDismissError: () => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [showValidation, setShowValidation] = useState(false)
  const updateForm = (updatedForm: CustomerForm) => {
    setShowValidation(true)
    if (error) onDismissError()
    onChange(updatedForm)
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={() => !isSaving && onClose()}><section className="customer-modal" role="dialog" aria-modal="true" aria-labelledby="add-customer-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-button" type="button" onClick={onClose} disabled={isSaving} aria-label="Close add customer form"><X size={21} /></button><h2 id="add-customer-title">Add a customer</h2><p className="modal-intro">A few details are all we need to welcome them in.</p>{error && <ErrorMessage message={error} onDismiss={onDismissError} />}<form onSubmit={onSubmit}><div className="form-row"><Field label="First name" value={form.firstName} invalid={showValidation && !form.firstName.trim()} onChange={(value) => updateForm({ ...form, firstName: value })} /><Field label="Last name" value={form.lastName} invalid={showValidation && !form.lastName.trim()} onChange={(value) => updateForm({ ...form, lastName: value })} /></div><PhoneField value={form.phoneNumber} invalid={showValidation && !/^\+2\d{11}$/.test(form.phoneNumber)} onChange={(value) => updateForm({ ...form, phoneNumber: value })} /><div className="form-actions"><button className="cancel-button" type="button" disabled={isSaving} onClick={onClose}>Cancel</button><button className="save-button" disabled={isSaving || !isCustomerFormValid(form)} type="submit">{isSaving ? 'Adding…' : 'Add customer'} <Plus size={18} /></button></div></form></section></div>
}

function Field({ label, value, onChange, type = 'text', placeholder, invalid = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; invalid?: boolean }) {
  return <label className={invalid ? 'invalid-field' : undefined}>{label}<input required maxLength={type === 'tel' ? 20 : 100} type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></label>
}

function PhoneField({ value, onChange, invalid = false }: { value: string; onChange: (value: string) => void; invalid?: boolean }) {
  return <label className={`phone-field${invalid ? ' invalid-field' : ''}`}>Phone number<span className="phone-input"><span className="country-code">+2</span><input required inputMode="numeric" pattern="[0-9]{11}" maxLength={11} placeholder="01001234567" value={subscriberNumber(value)} onChange={(event) => onChange(withCountryCode(event.target.value))} /></span><small>Enter 11 digits after the country code.</small></label>
}

function ErrorMessage({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <div className="error-message" role="alert"><AlertCircle size={20} /><span>{message}</span><button type="button" onClick={onDismiss} aria-label="Dismiss error"><X size={18} /></button></div>
}

function LoadingState({ message }: { message: string }) {
  return <div className="page-state"><LoaderCircle className="spinner" size={28} /> {message}</div>
}

function FailureState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="empty-state failure-state"><div className="empty-icon"><AlertCircle size={34} /></div><h3>We couldn’t load customers</h3><p>{message}</p><button className="text-button" type="button" onClick={onRetry}>Try again <ChevronRight size={18} /></button></div>
}

function EmptyState({ search, onClear, onAdd }: { search: string; onClear: () => void; onAdd: () => void }) {
  const hasSearch = Boolean(search.trim())
  return <div className={`empty-state${hasSearch ? ' no-results-state' : ''}`} role={hasSearch ? 'status' : undefined}><div className="empty-icon">{hasSearch ? <Search size={32} /> : <UsersRound size={34} />}</div><h3>{hasSearch ? 'This customer does not exist' : 'Your customer list is ready'}</h3><p>{hasSearch ? <>No customer was found for <strong>“{search.trim()}”</strong>. Search by a different name or phone number.</> : 'Add your first customer to start growing your community.'}</p>{hasSearch ? <button className="text-button" type="button" onClick={onClear}>Clear search <X size={17} /></button> : <button className="text-button" type="button" onClick={onAdd}>Add a customer <ChevronRight size={18} /></button>}</div>
}

async function responseMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string } | null
  return payload?.error ?? fallback
}

export default App
