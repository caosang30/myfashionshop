from django.contrib import messages
from django.shortcuts import redirect

def admin_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_staff and not request.user.is_superuser:
            messages.error(request, "Bạn không có quyền truy cập trang này.")
            return redirect('/')
        return view_func(request, *args, **kwargs)
    return wrapper
