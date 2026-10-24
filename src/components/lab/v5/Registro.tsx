/* las marcas de registro de un plano: dos ejes, cuatro esquinas en diagonal y cuatro vértices */
export function Registro() {
  return (
    <span className="v5-registro" aria-hidden>
      <span className="v5-reg-eje v5-reg-n" /><span className="v5-reg-eje v5-reg-s" />
      <span className="v5-reg-diag v5-reg-no" /><span className="v5-reg-diag v5-reg-ne" />
      <span className="v5-reg-diag v5-reg-so" /><span className="v5-reg-diag v5-reg-se" />
      <span className="v5-reg-punto v5-reg-pno" /><span className="v5-reg-punto v5-reg-pne" />
      <span className="v5-reg-punto v5-reg-pso" /><span className="v5-reg-punto v5-reg-pse" />
    </span>
  );
}
