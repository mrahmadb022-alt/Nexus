import { useRef, useState } from 'react'
import { Plus, Pencil, Trash2, IdCard, Camera } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import ManagerTopBar from '../../components/manager/ManagerTopBar'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'

const EMPTY_STAFF = { name: '', role: '', avatarUrl: null }

export default function Staff() {
  const { t } = useLanguage()
  const { staffList, removeStaffMember, addStaffMember, updateStaffMember } = useData()
  const photoInputRef = useRef(null)
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newStaff, setNewStaff] = useState(EMPTY_STAFF)
  const [savingStaff, guardSaveStaff] = useSubmitGuard()

  const openAddForm = () => {
    setEditingId(null)
    setNewStaff(EMPTY_STAFF)
    setShowAddStaff(true)
  }

  const openEditForm = (member) => {
    setEditingId(member.id)
    setNewStaff({
      name: member.name,
      role: member.roleKey ? t(member.roleKey) : member.role || '',
      avatarUrl: member.avatarUrl || null,
    })
    setShowAddStaff(true)
  }

  const closeForm = () => {
    setShowAddStaff(false)
    setEditingId(null)
    setNewStaff(EMPTY_STAFF)
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) setNewStaff((s) => ({ ...s, avatarUrl: URL.createObjectURL(file) }))
    e.target.value = ''
  }

  const handleSaveStaff = guardSaveStaff(() => {
    if (!newStaff.name.trim()) return
    const initials = newStaff.name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

    if (editingId) {
      updateStaffMember(editingId, {
        name: newStaff.name.trim(),
        role: newStaff.role.trim(),
        roleKey: null,
        initials,
        avatarUrl: newStaff.avatarUrl,
      })
    } else {
      addStaffMember({ name: newStaff.name.trim(), role: newStaff.role.trim(), initials, avatarUrl: newStaff.avatarUrl })
    }
    closeForm()
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ManagerTopBar />
      <div className="flex-1 p-4 lg:p-margin-desktop">
        <div className="max-w-container-max mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-sans text-display-lg-mobile md:text-display-lg text-on-surface">{t('Staff Management')}</h1>
              <p className="font-sans text-body-lg text-on-surface-variant mt-1">{t('Manage your team members.')}</p>
            </div>
            <button
              onClick={openAddForm}
              className="bg-primary text-on-primary px-4 py-2.5 rounded-md font-sans text-sm hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 self-start"
            >
              <Plus size={16} />
              {t('Add Staff')}
            </button>
          </div>

          <section className="bg-surface rounded-md border border-outline-variant/40 shadow-sm p-6 flex flex-col max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-sans text-headline-md text-on-surface flex items-center gap-2">
                <IdCard className="text-primary" size={20} />
                {t('Active Staff')}
              </h2>
              <span className="font-mono text-label-caps bg-surface-variant text-on-surface-variant px-2 py-1 rounded">
                {t('{n} Members').replace('{n}', staffList.length)}
              </span>
            </div>

            {showAddStaff && (
              <div className="mb-4 p-4 rounded-md border border-primary/30 bg-primary/5 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary transition-colors"
                    title={t('Upload Photo')}
                  >
                    {newStaff.avatarUrl ? (
                      <img src={newStaff.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={22} />
                    )}
                  </button>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="btn-secondary px-3 py-1.5 text-xs w-fit"
                    >
                      {t('Upload Photo')}
                    </button>
                    <span className="font-sans text-[11px] text-on-surface-variant">{t('Optional')}</span>
                  </div>
                  <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoSelect} />
                </div>
                <input
                  autoFocus
                  placeholder={t('Full Name')}
                  value={newStaff.name}
                  onChange={(e) => setNewStaff((s) => ({ ...s, name: e.target.value }))}
                  className="input-field"
                />
                <input
                  placeholder={t('Role')}
                  value={newStaff.role}
                  onChange={(e) => setNewStaff((s) => ({ ...s, role: e.target.value }))}
                  className="input-field"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={closeForm} className="btn-secondary px-4 py-2 text-sm">
                    {t('Cancel')}
                  </button>
                  <button onClick={handleSaveStaff} disabled={savingStaff} className="btn-primary px-4 py-2 text-sm disabled:opacity-60 disabled:pointer-events-none">
                    {t('Save')}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 flex-1">
              {staffList.map((member) => (
                <div
                  key={member.id}
                  className="group flex items-center justify-between p-3 rounded-md border border-outline-variant/30 hover:border-primary/30 hover:bg-surface-container-low transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-md overflow-hidden shrink-0 flex items-center justify-center font-semibold ${member.color}`}>
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        member.initials
                      )}
                    </div>
                    <div>
                      <h3 className="font-sans text-base text-on-surface">{member.name}</h3>
                      <p className="font-sans text-body-sm text-on-surface-variant">
                        {member.roleKey ? t(member.roleKey) : member.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditForm(member)}
                      className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded-md transition-colors"
                      title={t('Edit')}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => removeStaffMember(member.id)}
                      className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-md transition-colors"
                      title={t('Remove')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
