import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// 1. Definimos las reglas de validación
const vipSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Email inválido"),
  passport: z.string().min(5, "Pasaporte requerido para estatus VIP"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type VipFormData = z.infer<typeof vipSchema>;

export const VipForm = () => {
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<VipFormData>({
    resolver: zodResolver(vipSchema)
  });

  const onSubmit = async (data: VipFormData) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("⭐ ¡Bienvenido al Club Yellow Gold! Tu acceso VIP ha sido creado.");
        reset();
        navigate('/login');
      } else {
        toast.error(result.error || "Error al registrar");
      }
    } catch (error) {
      // Usamos la variable 'error' para ver el detalle en la consola del navegador
      console.error("Fallo de red en Yellow Airline:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      <div>
        <label className="block text-sm font-bold mb-1">Nombre Completo</label>
        <input {...register("name")} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-airline outline-none" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Email Corporativo</label>
        <input {...register("email")} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-airline outline-none" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">Pasaporte</label>
          <input {...register("passport")} className="w-full p-3 rounded-xl border border-gray-200" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Contraseña</label>
          <input type="password" {...register("password")} className="w-full p-3 rounded-xl border border-gray-200" />
        </div>
      </div>

      <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all">
        SOLICITAR ACCESO VIP ⭐
      </button>
    </form>
  );
};