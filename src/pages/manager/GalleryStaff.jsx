import { useRef, useState } from 'react'
import { Upload, Plus, Pencil, Trash2, IdCard, Images, ImagePlus } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import ManagerTopBar from '../../components/manager/ManagerTopBar'

export default function GalleryStaff() {
  const { t } = useLanguage()
  const { staffList, removeStaffMember, addStaffMember, gallery, addPhoto, removePhotos } = useData()
  const fileInputRef = useRef(null)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [newStaff, setNewStaff] = useState({ name: '', role: '' })

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => addPhoto(URL.createObjectURL(file)))
    e.target.value = ''
  }

  const togglePhoto = (id) =>
    setSelectedPhotos((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))

  const handleDeleteSelected = () => {
    removePhotos(selectedPhotos)
    setSelectedPhotos([])
  }

  const handleSaveStaff = () => {
    if (!newStaff.name.trim()) return
    const initials = newStaff.name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    addStaffMember({ name: newStaff.name.trim(), role: newStaff.role.trim(), initials })
    setNewStaff({ name: '', role: '' })
    setShowAddStaff(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ManagerTopBar title={t('Staff & Gallery Management')} />
      <div className="flex-1 p-4 lg:p-margin-desktop">
        <div className="max-w-container-max mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-sans text-display-lg-mobile md:text-display-lg text-on-surface">{t('Staff & Gallery Management')}</h1>
              <p className="font-sans text-body-lg text-on-surface-variant mt-1">{t('Manage your team members and portfolio images.')}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-surface text-primary border border-outline-variant px-4 py-2.5 rounded-md font-sans text-sm hover:bg-surface-container transition-colors flex items-center gap-2"
              >
                <Upload size={16} />
                {t('Add Photos')}
              </button>
              <button
                onClick={() => setShowAddStaff((s) => !s)}
                className="bg-primary text-on-primary px-4 py-2.5 rounded-md font-sans text-sm hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2"
              >
                <Plus size={16} />
                {t('Add Staff')}
              </button>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <section className="xl:col-span-7 bg-surface rounded-md border border-outline-variant/40 shadow-sm p-6 flex flex-col">
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
                    <button onClick={() => setShowAddStaff(false)} className="btn-secondary px-4 py-2 text-sm">
                      {t('Cancel')}
                    </button>
                    <button onClick={handleSaveStaff} className="btn-primary px-4 py-2 text-sm">
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
                        {member.initials}
                      </div>
                      <div>
                        <h3 className="font-sans text-base text-on-surface">{member.name}</h3>
                        <p className="font-sans text-body-sm text-on-surface-variant">
                          {member.roleKey ? t(member.roleKey) : member.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded-md transition-colors" title={t('Edit')}>
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

            <section className="xl:col-span-5 bg-surface rounded-md border border-outline-variant/40 shadow-sm p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sans text-headline-md text-on-surface flex items-center gap-2">
                  <Images className="text-primary" size={20} />
                  {t('Portfolio Gallery')}
                </h2>
                {selectedPhotos.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="text-error hover:text-error text-sm font-mono flex items-center gap-1"
                  >
                    <Trash2 size={16} /> {t('Delete Selected')} ({selectedPhotos.length})
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 overflow-y-auto pe-2 max-h-[500px]">
                {gallery.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group aspect-square rounded-md overflow-hidden bg-surface-variant border border-outline-variant/20"
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div
                      className={`absolute inset-0 transition-opacity ${selectedPhotos.includes(photo.id) ? 'bg-primary/30 opacity-100' : 'bg-black/20 opacity-0 group-hover:opacity-100'}`}
                    />
                    <label className="absolute top-2 start-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPhotos.includes(photo.id)}
                        onChange={() => togglePhoto(photo.id)}
                        className="w-5 h-5 rounded border-outline text-primary focus:ring-primary focus:ring-offset-0 bg-surface/80 backdrop-blur-sm"
                      />
                    </label>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-md border-2 border-dashed border-outline-variant/50 hover:border-primary hover:bg-surface-container-low transition-all flex flex-col items-center justify-center text-on-surface-variant hover:text-primary gap-2"
                >
                  <ImagePlus size={28} />
                  <span className="font-mono text-label-caps">{t('Upload')}</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
