import { supabase } from './supabaseClient.js'

/**
 * 회원가입 함수
 */
export async function signUp(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('회원가입 에러:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 로그인 함수
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('로그인 에러:', error.message)
    return { success: false, error: error.message }
  }
}

// 회원탈퇴: 비밀번호 재확인 후 데이터 전체 삭제 + 계정 삭제
export async function deleteAccount(password) {
  // 1) 현재 세션에서 이메일 가져오기
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('로그인 상태가 아닙니다.')

  const email = user.email

  // 2) 비밀번호 재확인 (재로그인 시도)
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (signInError) throw new Error('비밀번호가 올바르지 않습니다.')

  // 3) 저장된 비밀번호 데이터 삭제 (테이블명은 실제 프로젝트에 맞게 수정)
  const { error: dataError } = await supabase
    .from('password_analytics') //
    .delete()
    .eq('user_id', user.id)
  if (dataError) throw new Error('데이터 삭제 중 오류가 발생했습니다.')

  // 4) Supabase 계정 삭제 (Edge Function 또는 RPC 호출)
  // Supabase 클라이언트 측에서 직접 deleteUser는 Admin API만 가능하므로
  // Supabase Edge Function 또는 DB Function을 통해 처리합니다.
  const { error: deleteError } = await supabase.rpc('delete_user')
  if (deleteError) throw new Error('계정 삭제 중 오류가 발생했습니다.')

  // 5) 로컬 세션 정리
  await supabase.auth.signOut()
}
