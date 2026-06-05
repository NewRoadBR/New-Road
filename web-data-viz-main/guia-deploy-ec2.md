# 🚀 Guia Completo — Deploy de Site Node.js na AWS EC2

---

## PRÉ-REQUISITOS

- Conta na AWS
- Arquivo `.pem` da sua key pair
- Projeto Node.js no seu computador
- (Opcional) Domínio registrado

---

## PARTE 1 — Criar a EC2

1. Acesse **AWS Console → EC2 → Launch Instance**
2. AMI: **Ubuntu Server 24.04 LTS** (owner: Canonical, não Marketplace)
3. Tipo: **t2.micro** (free tier) ou **t3.small** para produção
4. Key pair: crie ou use uma existente — guarde o `.pem`!
5. Security Group — libere as portas:
   - SSH: `22`
   - HTTP: `80`
   - HTTPS: `443`
6. Lance a instância
7. **Crie um Elastic IP** e associe à instância (EC2 → Elastic IPs → Allocate → Associate) para o IP não mudar ao reiniciar

---

## PARTE 2 — Conectar via SSH (Windows)

### Corrigir permissão do .pem (PowerShell como Administrador)

```powershell
$keyPath = "C:\Users\Guxta\Downloads\novoLAB\chaveAPI.pem"

icacls $keyPath /inheritance:r
icacls $keyPath /remove "NT AUTHORITY\SYSTEM"
icacls $keyPath /remove "BUILTIN\Administrators"
icacls $keyPath /grant:r "Guxta:(R)"
```

### Conectar

```powershell
ssh -i "C:\Users\Guxta\Downloads\novoLAB\chaveAPI.pem" ubuntu@<IP-DA-EC2>
```

> ⚠️ Atenção: o usuário é **ubuntu** (com "u" no final)

---

## PARTE 3 — Configurar o servidor (dentro da EC2)

### Atualizar pacotes

```bash
sudo apt update && sudo apt upgrade -y
```

### Instalar NVM e Node.js

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
node -v && npm -v
```

### Instalar PM2 e Nginx

```bash
npm install -g pm2
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

---

## PARTE 4 — Enviar o projeto (PowerShell do Windows)

```powershell
scp -i "C:\Users\Guxta\Downloads\novoLAB\chaveAPI.pem" -r "C:\Users\Guxta\Downloads\New-Road\web-data-viz-main" ubuntu@<IP-DA-EC2>:/home/ubuntu/
```

> 💡 Dica: na próxima vez use Git + GitHub para evitar enviar o `node_modules` e facilitar atualizações:
> - Suba o projeto no GitHub
> - Na EC2: `git clone https://github.com/seu-usuario/seu-repo.git`

---

## PARTE 5 — Subir o servidor Node (dentro da EC2)

```bash
cd /home/ubuntu/web-data-viz-main
npm install
pm2 start server.js --name "meu-site"
pm2 save
pm2 startup
```

> ⚠️ Substitua `server.js` pelo arquivo principal do seu projeto (pode ser `index.js`, `app.js`, etc.)

### Verificar se está rodando

```bash
pm2 status
pm2 logs meu-site
```

---

## PARTE 6 — Configurar o Nginx (proxy reverso)

```bash
sudo nano /etc/nginx/sites-available/meu-site
```

Cole o conteúdo abaixo (substitua a porta `3000` pela porta do seu Node):

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Salvar: `Ctrl+X` → `Y` → `Enter`

### Ativar o site

```bash
sudo ln -s /etc/nginx/sites-available/meu-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## PARTE 7 — Configurar o Domínio

No painel do seu registrador de domínio (Registro.br, GoDaddy, Cloudflare etc.):

| Tipo | Nome | Valor |
|------|------|-------|
| A | `@` | IP público da EC2 (Elastic IP) |
| A | `www` | IP público da EC2 (Elastic IP) |

> ⚠️ O DNS pode levar até 48h para propagar (geralmente poucos minutos)

---

## PARTE 8 — HTTPS com SSL gratuito (Certbot)

>  Só rode após o DNS estar propagado

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Siga o wizard. O Certbot configura o redirect HTTP → HTTPS automaticamente.

### Testar renovação automática

```bash
sudo certbot renew --dry-run
```

---

## FLUXO FINAL

```
Usuário → DNS (dominio.com) → Elastic IP da EC2
→ Nginx (porta 80/443) → Node.js (porta 3000)
```

---

## COMANDOS ÚTEIS DO DIA A DIA

```bash
# Ver status dos processos Node
pm2 status

# Ver logs da aplicação
pm2 logs meu-site

# Reiniciar a aplicação
pm2 restart meu-site

# Ver uso de memória e CPU
free -h
htop

# Reiniciar Nginx
sudo systemctl reload nginx

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## ARQUITETURA FUTURA (quando adicionar banco de dados)

```
Site Node.js  →  EC2 (t3.small ou maior)
Banco de dados →  RDS (gerenciado AWS) ou EC2 separada com Docker
Arquivos/Assets → S3 (armazenamento estático)
```

>  Lembre: Docker roda em EC2 ou ECS — não na S3. A S3 é apenas armazenamento de arquivos.
