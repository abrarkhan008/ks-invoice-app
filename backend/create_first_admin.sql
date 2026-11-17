-- STEP A (dashboard): Authentication -> Users -> "Add user" -> "Create new user"
--    email:    admin@ks-hrms.app        password: (choose a strong one)   tick "Auto Confirm User"
-- STEP B: run this in SQL Editor:
insert into public.profiles (id, emp_code, name, role, designation)
select id, 'ADMIN', 'Administrator', 'admin', 'Admin'
from auth.users where email = 'admin@ks-hrms.app';
-- You now log in to the app with  Employee ID = ADMIN  and the password you chose.
