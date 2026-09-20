# Guía para trabajar en este proyecto con Antigravity

Este documento contiene las instrucciones y el prompt inicial para la instancia de **Antigravity** en la computadora de tu colaboradora.

---

## 📋 Verificaciones Previas (Hechas por ti)

1. **Permisos de Colaborador en GitHub**:
   - En GitHub (`KuroroX2/cositas-para-eventos`), ve a **Settings > Collaborators** y confirma que ella tenga rol de **Write** (y que haya aceptado la invitación por correo si era reciente).
2. **Autenticación en su PC**:
   - Asegurarse de que en la PC de ella Git esté configurado con su usuario:
     ```powershell
     git config --global user.name "Nombre De Ella"
     git config --global user.email "correo_de_ella@ejemplo.com"
     ```
   - La primera vez que haga `git push`, Windows / Git Credential Manager abrirá una ventana para iniciar sesión con su cuenta de GitHub.

---

## 🚀 Paso a Paso Inicial en la PC de ella

### Caso A: Si aún NO ha clonado el repositorio
1. Abre una terminal o PowerShell en la carpeta donde quiera guardar sus proyectos (ej. `C:\Proyectos`):
   ```powershell
   git clone https://github.com/KuroroX2/cositas-para-eventos.git
   ```
2. Abre la carpeta `cositas-para-eventos` en **Antigravity**.

### Caso B: Si YA tiene la carpeta abierta en Antigravity
1. Solo asegúrate de que esté sincronizada:
   ```powershell
   git pull origin main
   ```

---

## 🤖 Prompt para pegar en la instancia de Antigravity de ella

Copia y pega el siguiente bloque en el chat de su Antigravity al iniciar una sesión de trabajo:

```markdown
Hola Antigravity. Estoy colaborando en este proyecto web compartido ("cositas-para-eventos") sincronizado mediante GitHub.

Ten en cuenta las siguientes pautas de trabajo:
1. **Flujo de Git**:
   - Antes de iniciar cambios o al comenzar sesión, ejecuta siempre `git pull origin main` para asegurarte de que tengo la versión más reciente de mi compañero.
   - Cuando terminemos una tarea o serie de cambios, haz commit con un mensaje descriptivo y un `git push origin main`.
2. **Naturaleza del proyecto**:
   - Es un proyecto web estático con HTML, CSS, JavaScript vanilla y Supabase para backend/RSVP.
   - No requiere compiladores complejos (como Vite o Webpack) a menos que se indique.
   - Para probar y visualizar cambios localmente, puedes usar un servidor estático (como `npx -y serve .` o Live Server) o guiarme para abrir los archivos HTML en el navegador.
3. **Coordinación y Cuidado**:
   - Revisa siempre el `git status` antes de modificar archivos para no sobreescribir trabajo sin darnos cuenta.
   - Si detectas conflictos de Git en algún pull, ayúdame a resolverlos con cuidado sin perder cambios.
```

---

## 🔄 Flujo habitual de trabajo diario

| Acción | Comando recomendado | Notas |
| :--- | :--- | :--- |
| **Al iniciar el día / tarea** | `git pull origin main` | Descarga lo último que hayas subido tú. |
| **Ver estado** | `git status` | Muestra qué archivos modificó. |
| **Guardar y subir cambios** | `git add .`<br>`git commit -m "Descripción clara del cambio"`<br>`git push origin main` | Sube sus cambios a GitHub para que tú los puedas bajar. |

---

## 💡 Recomendaciones para evitar pisarse cambios
- **Avisarse**: Si van a tocar el mismo archivo (ej. `app.js` o `index.html`), coméntense brevemente para no editar las mismas líneas a la vez.
- **Pull frecuente**: Siempre hacer `git pull` antes de comenzar una edición y `git push` al terminarla.
