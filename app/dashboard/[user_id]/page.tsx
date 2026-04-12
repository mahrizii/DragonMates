export default function DashboardPage({
  params,
}: {
  params: { user_id: string };
}) {
  const { user_id } = params;

  return (
    <div className="h-screen bg-[#f5f6fa] font-sans flex flex-col overflow-hidden">
      <div className="bg-[#07294d] px-8 py-4 flex items-center justify-between shadow-md shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[#ffc600] tracking-wide">
            DragonMates
          </h1>
          <p className="text-blue-300 text-xs mt-0.5">Dashboard</p>
        </div>
        <span className="text-blue-200 text-sm">ID: {user_id}</span>
      </div>

      <div className="flex flex-1 gap-4 p-6 overflow-hidden">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col w-64 shrink-0 overflow-hidden self-start">
          <div className="bg-[#07294d] px-5 py-3">
            <h2 className="text-white font-semibold">Profile</h2>
          </div>
          <div className="p-5 flex flex-col gap-3 text-sm text-gray-700">
            <Field label="First Name" />
            <Field label="Last Name" />
            <Field label="Email" />
            <Field label="Hometown" />
            <Field label="Home State" />
            <Field label="Social Links" />
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4 overflow-hidden">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden self-start w-full">
            <div className="bg-[#07294d] px-5 py-3">
              <h2 className="text-white font-semibold">Academics</h2>
            </div>
            <div className="p-5 grid grid-cols-4 gap-4 text-sm text-gray-700">
              <Field label="Year" />
              <Field label="Major" />
              <Field label="Minor" />
              <Field label="GPA" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden self-start w-full">
            <div className="bg-[#07294d] px-5 py-3">
              <h2 className="text-white font-semibold">Living Style</h2>
            </div>
            <div className="p-5 grid grid-cols-3 gap-4 text-sm text-gray-700">
              <Field label="Bedtime" />
              <Field label="Wake Time" />
              <Field label="Temp" />
              <Field label="Noise Level" />
              <Field label="Cleanliness" />
              <Field label="Music" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden self-start w-full">
            <div className="bg-[#07294d] px-5 py-3">
              <h2 className="text-white font-semibold">Interests</h2>
            </div>
            <div className="p-5 text-sm text-gray-400">—</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label }: { label: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-gray-700 mt-0.5">—</p>
    </div>
  );
}
