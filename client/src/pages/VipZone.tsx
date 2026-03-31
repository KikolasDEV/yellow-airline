import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VipForm } from '../components/VipForm';
import toast from 'react-hot-toast';

export const VipZone = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      toast("Ya eres un miembro VIP", { icon: '⭐' });
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <h1 className="text-5xl font-black text-yellow-airline bg-black py-4 px-8 inline-block mb-6 skew-x-2">
        ÁREA VIP
      </h1>
      <p className="text-xl text-gray-600 mb-8 font-medium">
        Únete al club <span className="text-black font-bold">Yellow Gold</span> para acceder a vuelos exclusivos.
      </p>
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-yellow-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">⭐</div>
        <VipForm />
      </div>
    </div>
  );
};