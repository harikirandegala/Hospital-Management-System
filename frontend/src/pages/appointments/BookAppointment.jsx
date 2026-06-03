import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { appointmentApi, doctorApi, patientApi } from '../../services/api.js';
import { useAuthStore } from '../../context/authStore.js';
import toast from 'react-hot-toast';

const STEPS = ['Select Doctor', 'Pick Date & Slot', 'Confirm'];

export default function BookAppointment() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [step, setStep]             = useState(0);
  const [selectedDoctor, setDoctor]  = useState(null);
  const [selectedDate, setDate]      = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedSlot, setSlot]      = useState(null);
  const [reason, setReason]          = useState('');
  const [type, setType]              = useState('in_person');
  const [patientId, setPatientId]    = useState('');

  const isAdmin = ['admin','receptionist','nurse'].includes(user?.role);

  // Fetch doctors
  const { data: doctorsData, isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorApi.list().then((r) => r.data)
  });

  // Fetch available slots
  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ['slots', selectedDoctor?.id, selectedDate],
    queryFn: () => appointmentApi.slots({ doctor_id: selectedDoctor.id, date: selectedDate }).then((r) => r.data),
    enabled: !!selectedDoctor && !!selectedDate && step === 1
  });

  // Book mutation
  const bookMutation = useMutation({
    mutationFn: (data) => appointmentApi.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment booked!');
      navigate(`/appointments/${res.data.id}`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Booking failed.')
  });

  // Fetch patients (for admin/staff)
  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientApi.list().then((r) => r.data),
    enabled: isAdmin
  });

  const handleConfirm = () => {
    bookMutation.mutate({
      patient_id: isAdmin ? patientId : user.id,  // TODO: resolve from user_id
      doctor_id: selectedDoctor.id,
      start_time: selectedSlot.start,
      reason,
      type
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-500 text-sm mt-0.5">Schedule a consultation with a doctor</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
              ${i < step ? 'bg-brand-400 text-white'
                : i === step ? 'bg-brand-100 text-brand-600 ring-2 ring-brand-300'
                : 'bg-gray-100 text-gray-400'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="card">
        {/* ── STEP 0: Select Doctor ─────────────── */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Choose a doctor</h2>

            {loadingDoctors ? (
              <div className="text-center py-8 text-gray-400">Loading doctors…</div>
            ) : (
              <div className="space-y-2">
                {(doctorsData?.data || []).map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setDoctor(doc)}
                    className={`p-4 rounded-xl border cursor-pointer transition
                      ${selectedDoctor?.id === doc.id
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center
                                      text-teal-600 font-semibold text-sm">
                        {doc.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Dr. {doc.user?.name}</p>
                        <p className="text-xs text-gray-500">{doc.specialization} · {doc.department?.name}</p>
                      </div>
                      <div className="ml-auto text-xs text-gray-400">
                        ₹{doc.consultation_fee}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep(1)}
              disabled={!selectedDoctor}
              className="btn-primary w-full justify-center mt-2"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 1: Date & Slot ───────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <button onClick={() => setStep(0)} className="btn-ghost text-sm">← Back</button>
            <h2 className="font-semibold text-gray-900">Select date & time slot</h2>

            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={selectedDate}
                min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                onChange={(e) => { setDate(e.target.value); setSlot(null); }}
              />
            </div>

            {loadingSlots ? (
              <div className="text-center py-6 text-gray-400">Loading slots…</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {(slotsData?.slots || []).map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => slot.available && setSlot(slot)}
                    disabled={!slot.available}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition
                      ${!slot.available
                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                        : selectedSlot?.start === slot.start
                          ? 'bg-brand-400 text-white border-brand-400'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'}`}
                  >
                    {format(new Date(slot.start), 'hh:mm a')}
                    {!slot.available && <span className="block text-[10px] text-gray-300">Booked</span>}
                  </button>
                ))}
              </div>
            )}

            <div>
              <label className="label">Consultation type</label>
              <div className="flex gap-3">
                {['in_person', 'telemedicine'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-xl text-sm border transition
                      ${type === t ? 'border-brand-400 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600'}`}
                  >
                    {t === 'in_person' ? '🏥 In-person' : '💻 Telemedicine'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedSlot}
              className="btn-primary w-full justify-center"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2: Confirm ───────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <button onClick={() => setStep(1)} className="btn-ghost text-sm">← Back</button>
            <h2 className="font-semibold text-gray-900">Confirm appointment</h2>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <Row label="Doctor"     value={`Dr. ${selectedDoctor?.user?.name}`} />
              <Row label="Department" value={selectedDoctor?.department?.name} />
              <Row label="Date"       value={format(new Date(selectedSlot?.start), 'EEEE, MMM d yyyy')} />
              <Row label="Time"       value={format(new Date(selectedSlot?.start), 'hh:mm a')} />
              <Row label="Type"       value={type === 'in_person' ? 'In-person' : 'Telemedicine'} />
              <Row label="Fee"        value={`₹${selectedDoctor?.consultation_fee}`} />
            </div>

            {isAdmin && (
              <div>
                <label className="label">Patient</label>
                <select className="input" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                  <option value="">Select patient…</option>
                  {(patientsData?.data || []).map((p) => (
                    <option key={p.id} value={p.id}>{p.user?.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="label">Reason for visit (optional)</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Describe your symptoms or reason…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button
              onClick={handleConfirm}
              disabled={bookMutation.isPending || (isAdmin && !patientId)}
              className="btn-primary w-full justify-center"
            >
              {bookMutation.isPending ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
