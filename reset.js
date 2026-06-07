import { supabase } from './supabaseClient.js'

document.getElementById('update-btn').addEventListener('click', async () => {
  const newPassword = document.getElementById('password').value

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    alert('오류 발생: ' + error.message)
  } else {
    alert('비밀번호가 변경되었습니다!')
    // 변경 후 창을 닫거나 로그인 화면으로 이동
    window.close()
  }
})
