# NUTRIUSM

NUTRIUSM es una aplicación de registro de alimentación para estudiantes universitarios. Permite consultar información nutricional, organizar las comidas del día y comparar lo consumido con metas diarias.

El proyecto corresponde al MVP del Equipo 2 para la asignatura DIU de la Universidad Técnica Federico Santa María. Retoma el prototipo de la entrega anterior y reúne las mejoras realizadas por los seis integrantes.

**Repositorio:** [n0eli4/nutri-usm-mvp](https://github.com/n0eli4/nutri-usm-mvp)

**Aplicación publicada:** [NUTRIUSM](https://nutri-usm-mvp.vercel.app)

## Funciones principales

- **Buscar y registrar alimentos:** el buscador encuentra alimentos sin depender de tildes o mayúsculas. Cada alimento muestra su porción, calorías, proteínas, carbohidratos y grasas. Las cantidades se ajustan antes de confirmar el registro.
- **Revisar el Diario:** los registros se organizan por fecha y por desayuno, almuerzo, once o cena. Las porciones se pueden corregir y los alimentos se pueden eliminar, actualizando los totales.
- **Repetir comidas:** los favoritos facilitan encontrar alimentos habituales. Las comidas guardadas permiten volver a registrar sus ingredientes y cantidades.
- **Encontrar combinaciones:** las opciones incluyen filtros como Económica y Rápida, con costo y tiempo aproximados para explicar cada propuesta.
- **Consultar Progreso:** la sección compara el consumo con las metas, muestra lo que falta o se ha superado y presenta un resumen de los últimos siete días. La edición de metas incluye validación por campo.

También se incluye una sección Comunidad con publicaciones de ejemplo y la posibilidad de añadir contenido de forma local.

## Tecnologías

El proyecto utiliza React y TypeScript, TanStack Start y TanStack Router para la aplicación y sus rutas, Tailwind CSS para los estilos y Vite para el desarrollo y la compilación. Las dependencias se administran con Bun.

## Ejecución local

La ejecución requiere Git, Node.js y Bun instalados. La revisión local se realizó en Windows con Node.js 26.13.0 y Bun 1.4.4.

Desde una terminal se ejecutan los siguientes comandos:

```powershell
git clone https://github.com/n0eli4/nutri-usm-mvp.git
cd nutri-usm-mvp
bun install --frozen-lockfile
bun run dev
```

La aplicación queda disponible en [http://localhost:8080/](http://localhost:8080/). La terminal muestra la dirección utilizada por el servidor, que se detiene con `Ctrl+C`.

La opción `--frozen-lockfile` instala las versiones registradas en `bun.lock`.

## Compilación

Desde la carpeta del proyecto se ejecuta:

```powershell
bun run build
```

Este comando genera la compilación de producción de la aplicación. La instalación y la compilación se comprobaron durante la integración del equipo.

## Publicación en Vercel

La aplicación se publicó desde la terminal en el proyecto `nutri-usm-mvp` del equipo `grupo2-e39c`.

La configuración de `vite.config.ts` utiliza el preset `vercel` de Nitro y genera la carpeta `.vercel/output`.

Para actualizar el sitio desde una carpeta vinculada y una cuenta con acceso al proyecto se ejecutan:

```powershell
bun run build
bun x vercel deploy --prebuilt --prod
```

La vinculación inicial se realiza con `bun x vercel login` y `bun x vercel link`, seleccionando el proyecto existente.

La publicación es manual; cada actualización del sitio requiere compilar y desplegar.

## Almacenamiento y datos de ejemplo

Los registros, favoritos, comidas guardadas y metas se conservan al recargar mediante `localStorage`. Los datos pertenecen al navegador y a la dirección desde la que se abre la aplicación; otro navegador o dominio mantiene un almacenamiento independiente.

La aplicación parte con alimentos, comidas guardadas, registros y metas de ejemplo. Los costos de las combinaciones están expresados en pesos chilenos y, al igual que sus tiempos de preparación, son valores aproximados usados en el prototipo.

Comunidad funciona como una demostración local. Las publicaciones nuevas se guardan en el mismo navegador y no se comparten entre usuarios.

Las fechas del Diario se calculan con el calendario local del dispositivo. Durante la revisión se comprobaron seis casos de fechas para Chile, incluidos registros nocturnos, cambios de año y cambios de horario. También se comprobó que los cuatro tipos de datos se conservaran al recargar y que una meta igual a cero fuera rechazada.

## Organización del código

| Ubicación | Contenido |
| --- | --- |
| `src/routes/` | Pantallas de registro, Diario, Progreso y Comunidad, además de la navegación. |
| `src/lib/diary-store.tsx` | Estado compartido, almacenamiento local y funciones de fechas y registros. |
| `src/data/` | Alimentos, combinaciones y publicaciones de ejemplo. |
| `src/components/` | Componentes reutilizables de la interfaz. |
| `src/styles.css` | Estilos generales de la aplicación. |

## Integrantes y aportes

| Integrante | Aporte principal |
| --- | --- |
| Sebastian Madariaga | Navegación y claridad del proceso de registro. |
| Felipe Momberg | Búsqueda e información de alimentos. |
| Noelia Morales | Registro de comidas, Diario y edición de porciones. |
| Hans Gonzalez | Comidas guardadas y combinaciones con costos y tiempos. |
| Kevin Redel | Progreso, resumen semanal y validación de metas. |
| Luis Soto | Datos compartidos, corrección de fechas, integración, documentación y publicación. |

El código inicial proviene del prototipo desarrollado en Lovable para la entrega anterior. El equipo continuó el trabajo en este repositorio y conservó los commits de sus integrantes durante la integración.
