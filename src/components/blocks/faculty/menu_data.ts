export interface SubMenuItem {
  link: string
  title: string
}

export interface SubMenu {
  link?: string
  title: string
  inner_menu?: boolean
  inner_menus?: SubMenuItem[]
}

export interface MenuItem {
  id: number
  title: string
  link: string
  has_dropdown?: boolean
  has_dropdown_inner?: boolean
  mega_dropdown?: boolean
  sub_menus?: SubMenu[]
}

export const menu_data: MenuItem[] = [
  {
    id: 1,
    title: "Giới thiệu",
    link: "#",
    has_dropdown: true,
    mega_dropdown: true,
    sub_menus: [
      {
        link: "#",
        inner_menu: true,
        title: "Thông tin chung",
        inner_menus: [
          { link: "/about", title: "Về Khoa" },
          { link: "/instructor", title: "Đội ngũ giảng viên" },
          { link: "/organization-structure", title: "Cơ cấu tổ chức" },
          { link: "/organization", title: "Chi bộ" },
          { link: "/trade-union", title: "Công đoàn" },
        ],
      },
      {
        link: "#",
        inner_menu: true,
        title: "Các bộ môn",
        inner_menus: [
          { link: "/department/cong-nghe-thong-tin", title: "Công nghệ thông tin" },
          { link: "/department/khoa-hoc-may-tinh", title: "Khoa học máy tính" },
          { link: "/department/ky-thuat", title: "Kỹ thuật" },
          { link: "/department/cong-nghe-sinh-hoc", title: "CN Sinh học & Thực phẩm" },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Đào tạo",
    link: "#",
    has_dropdown: true,
    mega_dropdown: true,
    sub_menus: [
      {
        link: "#",
        inner_menu: true,
        title: "Đại học",
        inner_menus: [
          { link: "/courses/cong-nghe-thong-tin", title: "Công nghệ thông tin" },
          { link: "/courses/khoa-hoc-may-tinh", title: "Khoa học máy tính" },
          { link: "/courses/an-ninh-mang", title: "An ninh mạng" },
          { link: "/courses/ky-thuat-dien-dien-tu", title: "Kỹ thuật điện, điện tử" },
          { link: "/courses/cong-nghe-ky-thuat-o-to", title: "Công nghệ kỹ thuật ô tô" },
          { link: "/courses/ky-thuat-xay-dung", title: "Kỹ thuật xây dựng" },
          { link: "/courses/ky-thuat-xay-dung-cong-trinh-giao-thong", title: "KT xây dựng công trình giao thông" },
          { link: "/courses/cong-nghe-sinh-hoc", title: "Công nghệ sinh học" },
          { link: "/courses/cong-nghe-thuc-pham", title: "Công nghệ thực phẩm" },
          { link: "/courses/cong-nghe-nong-nghiep", title: "Công nghệ nông nghiệp" },
        ],
      },
      {
        link: "#",
        inner_menu: true,
        title: "Sau đại học",
        inner_menus: [
          { link: "/courses/thac-si-khoa-hoc-may-tinh", title: "Thạc sĩ Khoa học máy tính" },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Nghiên cứu",
    link: "#",
    has_dropdown: true,
    sub_menus: [
      { link: "/nghien-cuu", title: "Tổng quan & Định hướng" },
      { link: "/nghien-cuu/de-tai", title: "Đề tài nghiên cứu" },
      { link: "/nghien-cuu/cong-bo", title: "Công bố khoa học" },
    ],
  },
  {
    id: 4,
    title: "Sinh viên",
    link: "#",
    has_dropdown: true,
    sub_menus: [
      { link: "/youth-union", title: "Đoàn - Hội sinh viên" },
      { link: "/welcome-freshers", title: "Chào đón tân sinh viên" },
      { link: "/hinh-anh", title: "Hình ảnh hoạt động" },
    ],
  },
  {
    id: 5,
    title: "Tin tức",
    link: "#",
    has_dropdown: true,
    sub_menus: [
      { link: "/tin-tuc-thong-bao", title: "Tin tức & Thông báo" },
      { link: "/event", title: "Sự kiện" },
    ],
  },
  {
    id: 6,
    title: "Liên hệ",
    link: "/contact",
    has_dropdown: false,
  },
]

export default menu_data

