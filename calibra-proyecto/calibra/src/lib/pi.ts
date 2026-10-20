// Minievento del Día de π (pedido del usuario 2026-10-19): «quien escriba más dígitos
// de π en 1 minuto, gana». Los 1000 primeros decimales, calculados con la fórmula de
// Machin (no copiados a mano). Se juega en la web y la app; la tabla del día está en
// la base (0295).
export const DECIMALES_PI = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";

export const SEGUNDOS_PI = 60;
// Desde cuántos dígitos el Día de π da el título «Irracional».
export const DIGITOS_TITULO_PI = 31;

// Cuántos decimales seguidos están bien desde el principio.
export function digitosCorrectos(escrito: string): number {
  let n = 0;
  while (n < escrito.length && escrito[n] === DECIMALES_PI[n]) n++;
  return n;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = { rpc: (fn: string, args?: Record<string, unknown>) => any };

export interface FilaTablaPi {
  nombre: string;
  digitos: number;
  yo: boolean;
}

export async function guardarDigitosPi(sb: SupabaseClient, digitos: number): Promise<{ mejor: number; titulo: boolean } | null> {
  const { data, error } = await sb.rpc("guardar_digitos_pi", { p_digitos: digitos });
  if (error) return null;
  return (Array.isArray(data) ? data[0] : data) as { mejor: number; titulo: boolean };
}

export async function tablaPi(sb: SupabaseClient): Promise<FilaTablaPi[]> {
  const { data, error } = await sb.rpc("tabla_pi_hoy");
  if (error || !data) return [];
  return data as FilaTablaPi[];
}
