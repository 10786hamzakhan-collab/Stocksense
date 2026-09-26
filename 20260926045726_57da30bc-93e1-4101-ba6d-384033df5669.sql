
REVOKE ALL ON FUNCTION public.apply_move(uuid,uuid,numeric,text,public.move_type,uuid,uuid,boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.next_reference(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_receipt(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_delivery(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_transfer(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_adjustment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.next_reference(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_receipt(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_delivery(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_transfer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_adjustment(uuid) TO authenticated;
