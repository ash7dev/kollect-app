const https = require('https');
const http = require('http');

require('dotenv').config();

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/admin/create-admin-simple',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const client = options.port === 443 ? https : http;
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (error) {
          resolve(body);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function createAdmin() {
  const args = process.argv.slice(2);
  let email = '';
  let password = '';
  let firstName = '';
  let lastName = '';

  // Parser les arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-e' && args[i + 1]) email = args[i + 1];
    if (args[i] === '-p' && args[i + 1]) password = args[i + 1];
    if (args[i] === '-f' && args[i + 1]) firstName = args[i + 1];
    if (args[i] === '-l' && args[i + 1]) lastName = args[i + 1];
  }

  if (!email || !firstName || !lastName) {
    console.log('❌ Arguments requis: -e <email> -f <firstName> -l <lastName>');
    console.log('Optionnel: -p <password>');
    process.exit(1);
  }

  try {
    console.log('👤 Création de l\'utilisateur admin...');
    
    const data = {
      email,
      firstName,
      lastName,
      ...(password && { password })
    };

    const response = await makeRequest(data);
    console.log('✅ Utilisateur admin créé avec succès!');
    console.log(response);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
    console.log('\n💡 Assurez-vous que le serveur API est démarré sur http://localhost:3001');
    console.log('   Lancez: npm run start:dev');
  }
}

createAdmin();
