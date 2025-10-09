from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib import messages
from django.core import serializers
from django.shortcuts import redirect, get_object_or_404

# Create your views here.
def management(request):
    # If request user is customer
    if not request.user.is_superuser and not request.user.is_staff:
        messages.error(request, "Bạn không có quyền truy cập trang này")
        return redirect('/')

    search_key = request.GET.get('search_key', '').strip()

    if search_key:
        users = User.objects.filter(username__icontains=search_key)
    else:
        users = User.objects.all()

    context = {
        'users': users,
        'search_key': search_key
    }
    return render(request, 'management.html', context)

def create_user(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")

        # Kiểm tra dữ liệu
        if password != confirm_password:
            messages.error(request, "Mật khẩu xác nhận không khớp!")
            return redirect("management")

        if User.objects.filter(username=username).exists():
            messages.error(request, "Tên người dùng đã tồn tại!")
            return redirect("management")

        # Tạo user mới
        user = User.objects.create_user(
            username=username,
            password=password,
        )
        user.is_staff = False
        user.is_superuser = False
        user.save()

        messages.success(request, "Tạo người dùng thành công!")
        return redirect("management")

    return render(request, "management.html")

def edit_user(request, user_id):
    user = get_object_or_404(User, pk=user_id)

    if request.method == 'POST':
        old_password = request.POST.get('old_password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')

        if not user.check_password(old_password):
            messages.error(request, "Mật khẩu cũ không chính xác!")
            return render(request, 'edit_user.html', {'user': user})

        if not new_password or not confirm_password:
            messages.error(request, "Vui lòng nhập đầy đủ mật khẩu mới và xác nhận!")
            return render(request, 'edit_user.html', {'user': user})

        if new_password != confirm_password:
            messages.error(request, "Mật khẩu xác nhận không khớp!")
            return render(request, 'edit_user.html', {'user': user})

        user.set_password(new_password)
        user.save()
        messages.success(request, f"Đã cập nhật mật khẩu cho người dùng '{user.username}' thành công!")

        return redirect('management')

    return render(request, 'edit_user.html', {'user': user})

def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id)

    # Không cho phép xóa tài khoản admin
    if user.is_superuser:
        messages.error(request, "Không thể xóa tài khoản admin!")
        return redirect('management')

    user.delete()
    messages.success(request, f"Đã xóa người dùng '{user.username}' thành công.")
    return redirect('management')