const cp = require('child_process');
const token = 'sbp_9cb3069a3601ac183118513ed68481d9741d571a';
const password = '&bh57%VckPAS9V&';
// Using spawnSync to bypass shell parsing issues with special characters in password
const result = cp.spawnSync('npx.cmd', ['supabase', 'link', '--project-ref', 'lbqprihivhehutomrzbr', '--password', password], {
  stdio: 'inherit',
  env: {
    ...process.env,
    SUPABASE_ACCESS_TOKEN: token
  }
});
process.exit(result.status);
