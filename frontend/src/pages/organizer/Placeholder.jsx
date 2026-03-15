const Placeholder = ({ title }) => {
  return (
    <div>
      <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">{title}</h2>
      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 py-20 text-center">
        <p className="text-slate-500 font-medium italic">
          The {title} management module is under construction is phase 2.
        </p>
      </div>
    </div>
  );
};

export default Placeholder;
