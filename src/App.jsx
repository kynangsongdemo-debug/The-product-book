import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Check, Target, Layers, ArrowDown,
  X, Users, Search, Infinity as InfinityIcon, Activity, 
  FileText, Monitor, Code, Sparkles, PieChart,
  User, Mail, BookOpen, Phone
} from 'lucide-react';
import productAcademyLogo from './assets/Product academy_White.svg';
import { normalizeVnPhone, isValidVnPhone } from '../lib/validatePhone.js';

const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// --- Hiệu ứng Scrollytelling cao cấp ---
const Reveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translate-y-12';
      case 'down': return '-translate-y-12';
      case 'left': return 'translate-x-12';
      case 'right': return '-translate-x-12';
      default: return 'translate-y-12';
    }
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100 transform-none blur-none' : `opacity-0 ${getTransform()} blur-[4px]`
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default function App() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeChapter, setActiveChapter] = useState(null);
  const brandLogo = productAcademyLogo;
  const scrollToForm = () => {
    const formSection = document.getElementById('download');
    if (!formSection) return;
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name || !email || !phone) return;

    if (name.length < 2) {
      setSubmitError('Vui lòng nhập họ tên (ít nhất 2 ký tự).');
      return;
    }

    if (!isValidEmailFormat(email)) {
      setSubmitError('Vui lòng nhập email đúng định dạng.');
      return;
    }

    if (!isValidVnPhone(phone)) {
      setSubmitError('Vui lòng nhập số điện thoại di động Việt Nam hợp lệ (ví dụ: 0912345678).');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email.toLowerCase(),
          phone: normalizeVnPhone(phone),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Không thể gửi đăng ký. Vui lòng thử lại.');
      }

      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CÁCH SỬA LỖI ICON Ở ĐÂY: Chỉ truyền tên Component (Icon: Users) thay vì thẻ HTML (<Users />)
  const chapters = [
    { id: "01", Icon: Users, title: "Vai trò & Định kiến", desc: "Gỡ bỏ định kiến về vai trò của PM và cách điều phối công việc giữa Kinh doanh, Engineering và Design." },
    { id: "02", Icon: Search, title: "Nhận diện vấn đề", desc: "Kỹ năng đặt câu hỏi để nhận diện vấn đề thực sự của người dùng thay vì đưa ra các quyết định phỏng đoán." },
    { id: "03", Icon: InfinityIcon, title: "Vòng lặp kết nối", desc: "Cách phân loại ý tưởng và thiết lập vòng lặp kết nối biến người dùng thử thành người dùng gắn bó." },
    { id: "04", Icon: Activity, title: "Đo lường nhu cầu", desc: "Kỹ thuật tạo ra các bài thử nghiệm để đo lường nhu cầu thực tế trước khi giao yêu cầu cho lập trình viên." },
    { id: "05", Icon: FileText, title: "Bí quyết viết PRD", desc: "Nghệ thuật viết yêu cầu chức năng mượt mà, loại bỏ chi tiết thừa để đội ngũ thực thi đạt hiệu quả tối ưu." },
    { id: "06", Icon: Monitor, title: "Nguyên tắc giao diện", desc: "Giao tiếp và đánh giá giao diện sản phẩm dựa trên luồng logic thay vì bế tắc tranh cãi cảm tính." },
    { id: "07", Icon: Code, title: "Tương tác Engineering", desc: "Quy trình tương tác hàng ngày với lập trình viên từ cách chia nhỏ tiến độ đến thương lượng thời hạn." },
    { id: "08", Icon: Sparkles, title: "Góc nhìn Marketing", desc: "Thay đổi sang góc nhìn Marketing để đóng gói thông điệp truyền thông chuẩn bị cho ngày phát hành." },
    { id: "09", Icon: PieChart, title: "Sử dụng số liệu", desc: "Quy trình sử dụng số liệu và cách thức tổ chức đội ngũ để dự án đi qua từng vòng lặp cập nhật ổn định." },
  ];

  return (
    <div className="min-h-screen bg-[#030e2a] text-slate-300 selection:bg-[#ff71f9]/30 selection:text-white antialiased font-light overflow-x-hidden" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap');
        .font-serif-accent { font-family: 'Playfair Display', serif; }
        .book-container {
          perspective: 1200px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.5rem;
        }
        .book-cover {
          width: 280px;
          height: 400px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 4px 16px 16px 4px;
          position: relative;
          transform: rotateY(-15deg);
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow:
            inset 6px 0 12px rgba(255,255,255,0.05),
            inset -2px 0 5px rgba(0,0,0,0.4),
            25px 25px 40px -10px rgba(0,0,0,0.3),
            10px 10px 20px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          text-align: center;
          overflow: hidden;
        }
        .book-cover::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 14px;
          background: linear-gradient(to right, #020617, #1e293b 20%, #020617 100%);
          border-radius: 4px 0 0 4px;
          border-right: 1px solid rgba(255,255,255,0.1);
        }
        .book-cover::after {
          content: '';
          position: absolute;
          top: 2%;
          bottom: 2%;
          right: -4px;
          width: 4px;
          background: #f1f5f9;
          border-radius: 0 4px 4px 0;
          box-shadow: inset 1px 0 2px rgba(0,0,0,0.2);
          z-index: -1;
        }
        .book-container:hover .book-cover {
          transform: rotateY(-5deg) scale(1.02);
        }
        .book-texture {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPjwvc3ZnPg==');
          border-radius: inherit;
          pointer-events: none;
        }
        .book-kicker {
          font-size: 6px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(191, 219, 254, 0.78);
          font-weight: 500;
          margin-bottom: 1.1rem;
          width: 100%;
          text-align: center;
        }
        .book-title-the {
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1;
          color: #f3f4f6;
          margin-bottom: 0.2rem;
          width: 100%;
          text-align: center;
        }
        .book-title-product {
          font-family: 'Playfair Display', serif;
          font-size: 2.15rem;
          font-weight: 700;
          font-style: italic;
          line-height: 0.95;
          color: #ef67ee;
          max-width: 100%;
          white-space: nowrap;
          width: 100%;
          text-align: center;
          margin-left: 0;
        }
        .book-title-book {
          font-size: 1.15rem;
          font-weight: 700;
          line-height: 1;
          color: #f3f4f6;
          margin-top: 0.2rem;
          letter-spacing: -0.01em;
          width: 100%;
          text-align: center;
        }
        .book-subtitle {
          color: rgba(219, 234, 254, 0.95);
          font-size: 0.36rem;
          font-weight: 500;
          line-height: 1;
          letter-spacing: 0;
          text-transform: none;
          max-width: 100%;
          white-space: nowrap;
          width: 100%;
          text-align: center;
        }
      `}</style>

      {/* Abstract Ambient Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-[#ff71f9] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.03]"></div>
         <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-500 rounded-full mix-blend-screen filter blur-[250px] opacity-[0.04]"></div>
      </div>

      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#030e2a]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between gap-4">
          <img src={brandLogo} alt="Product Academy logo" className="h-9 w-auto object-contain" />
          <p className="text-white text-sm md:text-base tracking-[0.14em] uppercase font-medium text-right">Product Academy</p>
        </div>
      </header>

      {/* 1. Mở đầu */}
      <section className="relative min-h-[100svh] flex flex-col justify-center px-6 md:px-12 z-10 border-b border-white/[0.05] pt-16">
        <div className="max-w-6xl mx-auto w-full">
          <Reveal>
            <div className="flex items-center space-x-4 mb-8">
              <span className="w-8 h-[1px] bg-[#ff71f9]"></span>
              <span className="text-[#ff71f9] text-xs font-medium tracking-[0.3em] uppercase">Hành trình làm sản phẩm</span>
            </div>
          </Reveal>
          
          <div className="grid md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-center">
            <div className="md:col-span-6">
              <Reveal delay={100}>
                <div className="flex flex-col items-start gap-8">
                  <div className="book-container group cursor-pointer">
                    <div className="book-cover">
                      <div className="book-texture"></div>
                      <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <div className="max-w-[140px] px-1 flex flex-col items-center justify-center text-center">
                          <span className="book-kicker">
                          Product Academy Edition
                          </span>
                          <h3 className="flex flex-col items-center justify-center mb-2 text-center w-full">
                            <span className="book-title-the">The</span>
                            <span className="book-title-product">Product</span>
                            <span className="book-title-book">Book</span>
                          </h3>
                          <div className="w-9 h-px bg-slate-500/60 my-3"></div>
                          <p className="book-subtitle">
                            Cẩm nang trở thành Product Manager xuất sắc
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToForm}
                    className="group inline-flex items-center justify-center px-8 py-4 bg-[#ff71f9] text-[#030e2a] font-medium tracking-[0.1em] uppercase text-sm rounded-full hover:bg-white transition-colors duration-500"
                  >
                    Đăng ký tải tài liệu
                    <ArrowDown strokeWidth={1.6} size={16} className="ml-3 transition-transform group-hover:translate-y-1" />
                  </button>
                </div>
              </Reveal>
            </div>
            <div className="md:col-span-6">
              <Reveal delay={200}>
                <h1 className="text-4xl md:text-6xl lg:text-[4.5rem] text-white mb-8 leading-[1.12] tracking-tight font-medium">
                  Khởi đầu hành trình <br className="hidden md:block"/>trở&nbsp;thành{" "}
                  <span className="font-serif-accent italic text-[#ff71f9] font-normal">Product Manager</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-light mb-16">
                  Có thể bạn vừa bước chân vào vị trí Product Manager vì công ty nhận thấy bạn có kỹ năng quản trị dự án tốt. Hoặc bạn đang làm Engineering, BA, hay là sinh viên muốn dấn thân vào nghề sản phẩm. Và khi bắt đầu tìm hiểu, rất nhanh bạn sẽ nhận ra... <span className="text-white">mình bị choáng ngợp.</span>
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 Nỗi đau */}
      <section className="py-32 md:py-48 px-6 z-10 relative">
        <div className="max-w-5xl mx-auto text-center">
          <Reveal>
            <p className="text-2xl md:text-4xl lg:text-5xl text-white leading-tight md:leading-[1.4] tracking-tight font-medium">
              "Bạn lọt thỏm vào một luồng dữ liệu khổng lồ nhưng chắp vá: <span className="font-serif-accent italic text-[#ff71f9] font-normal">một chút Agile, hàng tá biểu mẫu PRD, hàng loạt chỉ số đo lường...</span> nghe thì hợp lý, nhưng khi bắt tay vào dự án từ số không, bạn lại bối rối không biết bước đầu tiên phải làm gì."
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2. Khoảng cách thực tế */}
      <section className="py-32 px-6 relative z-10 border-t border-white/[0.02] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-16 items-center">
          <div className="md:col-span-5">
            <Reveal>
               <span className="text-slate-500 text-xs font-medium tracking-[0.2em] uppercase block mb-6">Sự thật phũ phàng</span>
               <h2 className="text-3xl md:text-5xl text-white mb-8 font-medium">Khoảng cách <br/> <span className="font-serif-accent italic text-[#ff71f9] font-normal">thực chiến.</span></h2>
               <p className="text-slate-400 leading-relaxed mb-6 text-lg">
                 Hiện nay không có nhiều hệ thống chính quy hay trường đại học hướng dẫn cặn kẽ lộ trình làm nghề này.
               </p>
               <p className="text-white leading-relaxed text-lg">
                 Hệ quả là chúng ta thường học nhầm <span className="font-serif-accent italic text-[#ff71f9]">"phần ngọn"</span> (công cụ, biểu mẫu) mà bỏ lỡ <span className="font-medium">"phần gốc"</span>. Thiếu một hệ thống quy chuẩn khiến bạn quẩn quanh giữa lý thuyết rời rạc và bài toán kinh doanh thực tế.
               </p>
            </Reveal>
          </div>
          <div className="md:col-span-6 md:col-start-7 relative">
            <Reveal direction="left" delay={200}>
              <div className="aspect-square max-w-md mx-auto relative border border-white/5 p-8 flex flex-col justify-between">
                <div className="w-full border-t border-dashed border-slate-600 relative">
                  <div className="absolute -top-3 left-0 bg-[#030e2a] px-2 text-xs tracking-widest text-slate-500">LÝ THUYẾT</div>
                </div>
                
                <div className="flex justify-center items-center h-full">
                  <div className="w-32 h-32 rounded-full border-[0.5px] border-[#ff71f9]/50 flex items-center justify-center relative">
                    <div className="w-20 h-20 rounded-full border-[0.5px] border-white/20 absolute -ml-10 mix-blend-screen"></div>
                    <div className="w-20 h-20 rounded-full border-[0.5px] border-white/20 absolute ml-10 mix-blend-screen"></div>
                    <div className="text-[#ff71f9] text-[10px] tracking-widest mt-24">MISSING LINK</div>
                  </div>
                </div>

                <div className="w-full border-t border-dashed border-slate-600 relative">
                  <div className="absolute -top-3 right-0 bg-[#030e2a] px-2 text-xs tracking-widest text-slate-500">THỰC CHIẾN</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. Lời giải */}
      <section className="py-32 md:py-48 px-6 z-10 relative">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="w-16 h-16 mx-auto border border-[#ff71f9]/30 rounded-full flex items-center justify-center mb-8 text-[#ff71f9]">
              <BookOpen strokeWidth={1} size={28} />
            </div>
            <h2 className="text-3xl md:text-5xl text-white mb-8 font-medium">Vượt qua <span className="font-serif-accent italic text-[#ff71f9] font-normal">rào cản</span></h2>
            <p className="text-xl md:text-2xl text-slate-300 font-light leading-relaxed mb-12">
              Cộng đồng làm sản phẩm toàn cầu thường truyền tay nhau <span className="font-serif-accent font-medium text-[#ff71f9] italic">The Product Book</span> từ Product School - tài liệu đi thẳng vào phần gốc, giúp bạn định vị bản thân như người kiểm soát dòng chảy công việc tổng thể.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="border-l border-[#ff71f9]/50 pl-8 text-left inline-block max-w-2xl">
              <p className="text-slate-400 text-lg">
                Tuy nhiên, với độ dày hàng trăm trang chứa đựng bài toán vĩ mô tại Thung lũng Silicon, không phải ai cũng dễ dàng chuyển hóa cho dự án ở Việt Nam. Việc bắt đầu bằng một tài liệu quá cồng kềnh lại dễ tạo ra ma sát khiến bạn nản lòng.
                <br/><br/>
                <span className="text-white">Đó là lý do bản tóm lược tinh gọn này ra đời.</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. Đối tượng */}
      <section className="py-24 px-6 relative z-10 border-y border-white/[0.05] bg-gradient-to-b from-white/[0.01] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 relative">
            <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2"></div>
            
            <Reveal direction="left">
              <div>
                <h3 className="text-sm font-medium tracking-[0.2em] text-[#ff71f9] uppercase mb-12 flex items-center">
                  <Target size={16} strokeWidth={1.5} className="mr-4" /> Dành cho ai
                </h3>
                <ul className="space-y-8">
                  <li className="flex items-start">
                    <Check className="text-[#ff71f9] mr-5 shrink-0 mt-1 opacity-70" size={18} strokeWidth={1.5} />
                    <div className="text-lg text-slate-300 leading-relaxed font-light">
                      <strong className="text-white font-normal block mb-1">Nhân sự rẽ ngang</strong>
                      Đang bị choáng ngợp trước bể kiến thức trên mạng, cần một lộ trình định hướng rõ ràng.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-[#ff71f9] mr-5 shrink-0 mt-1 opacity-70" size={18} strokeWidth={1.5} />
                    <div className="text-lg text-slate-300 leading-relaxed font-light">
                      <strong className="text-white font-normal block mb-1">Chuyên gia kỹ thuật/thiết kế</strong>
                      Xuất thân từ Engineering, Design, hoặc BA muốn hiểu bức tranh lớn trong khâu ra quyết định làm sản phẩm.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-[#ff71f9] mr-5 shrink-0 mt-1 opacity-70" size={18} strokeWidth={1.5} />
                    <div className="text-lg text-slate-300 leading-relaxed font-light">
                      <strong className="text-white font-normal block mb-1">Sinh viên định hướng PM</strong>
                      Muốn có một cái nhìn chân thực về công việc hàng ngày thực tế.
                    </div>
                  </li>
                </ul>
              </div>
            </Reveal>

            <Reveal direction="right" delay={200}>
              <div>
                <h3 className="text-sm font-medium tracking-[0.2em] text-slate-500 uppercase mb-12 flex items-center">
                  <X size={16} strokeWidth={1.5} className="mr-4" /> Không phù hợp
                </h3>
                <ul className="space-y-8 text-slate-500">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full mr-5 shrink-0 mt-2.5"></span>
                    <div className="text-lg leading-relaxed font-light">
                      Chỉ tìm kiếm bộ công cụ, biểu mẫu để sao chép vào làm ngay tức thời mà không hiểu cốt lõi.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full mr-5 shrink-0 mt-2.5"></span>
                    <div className="text-lg leading-relaxed font-light">
                      Đã có kinh nghiệm quản trị sản phẩm vững vàng trên 5 năm.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full mr-5 shrink-0 mt-2.5"></span>
                    <div className="text-lg leading-relaxed font-light">
                      Cần bài hướng dẫn sử dụng phần mềm thiết kế hay lập trình nhấp chuột theo từng bước.
                    </div>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. Nội dung 9 chương */}
      <section className="py-32 md:py-48 px-6 z-10 relative">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between">
              <div>
                <span className="text-[#ff71f9] text-xs font-medium tracking-[0.3em] uppercase mb-4 block">Mục lục tinh gọn</span>
                <h2 className="text-4xl md:text-5xl text-white font-medium">Bức tranh <span className="font-serif-accent italic text-[#ff71f9] font-normal">toàn cảnh.</span></h2>
              </div>
              <p className="text-slate-500 mt-6 md:mt-0 max-w-xs text-sm">9 chương cốt lõi được chắt lọc từ tài liệu nguyên bản, đi thẳng vào vấn đề thực chiến.</p>
            </div>
          </Reveal>

          <div className="border-t border-white/[0.05]">
            {chapters.map((chapter, index) => (
              <Reveal key={index} delay={index * 50}>
                <div 
                  className={`group flex flex-col md:flex-row py-8 border-b border-white/[0.05] hover:border-white/20 transition-colors duration-500 cursor-default ${activeChapter === index ? 'bg-white/[0.02]' : ''}`}
                  onMouseEnter={() => setActiveChapter(index)}
                  onMouseLeave={() => setActiveChapter(null)}
                >
                  <div className="md:w-1/4 flex items-center mb-4 md:mb-0">
                    <div className="text-slate-600 group-hover:text-[#ff71f9] transition-colors duration-300 mr-4">
                      {/* GỌI ICON BẰNG DẠNG COMPONENT ĐỂ TRÁNH LỖI HOOK */}
                      <chapter.Icon size={18} strokeWidth={1.5} />
                    </div>
                    <span className="text-xs font-mono text-slate-600 group-hover:text-[#ff71f9] transition-colors duration-300 mr-4">{chapter.id}</span>
                    <h3 className="text-xl font-medium text-white transition-transform duration-300 group-hover:translate-x-2">{chapter.title}</h3>
                  </div>
                  <div className="md:w-3/4 md:pl-12 flex justify-between items-start">
                    <p className="text-slate-400 font-light leading-relaxed max-w-2xl">{chapter.desc}</p>
                    <ArrowRight strokeWidth={1} className="text-slate-700 group-hover:text-[#ff71f9] transition-all duration-300 group-hover:translate-x-2 hidden md:block" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 6 & 7. Form CTA */}
      <section className="py-32 px-6 relative z-10 bg-[#02081a] border-t border-white/[0.05]" id="download">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-16">
          
          <div className="md:col-span-5 md:pr-12 md:border-r border-white/[0.05] flex flex-col justify-center">
            <Reveal>
              <div className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase mb-8 flex items-center">
                <Layers strokeWidth={1} size={16} className="mr-3" /> Curated by
              </div>
              <h3 className="text-2xl text-white mb-6 font-medium"><span className="font-serif-accent italic text-[#ff71f9] font-normal">Product</span> Academy</h3>
              <div className="space-y-6 text-slate-400 font-light text-lg leading-relaxed">
                <p>
                  Product Academy đã lựa chọn tóm lược nguyên bản The Product Book như một nỗ lực xây dựng hệ thống thư viện tài liệu cho người làm nghề Phát triển sản phẩm tại Việt Nam.
                </p>
                <p>
                  Chúng tôi lựa chọn các tài liệu từ nguồn uy tín, biên dịch hoặc tóm lược để gửi tới cộng đồng, đặc biệt dành cho học viên của Product Academy.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-6 md:col-start-7 flex flex-col justify-center">
            <Reveal delay={200}>
              {!isSubmitted ? (
                <div>
                  <h2 className="text-3xl text-white mb-2 font-medium">Nhận tài liệu <span className="font-serif-accent italic text-[#ff71f9] font-normal">độc quyền.</span></h2>
                  <p className="text-slate-400 font-light mb-12">Để lại thông tin của bạn để nhận link đọc miễn phí bản tóm lược 9 chương (đọc online).</p>

                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="relative group">
                      <input 
                        type="text" 
                        required
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-transparent border-b border-white/20 text-white py-3 px-0 focus:outline-none focus:border-[#ff71f9] transition-colors peer placeholder-transparent"
                        placeholder="Tên của bạn"
                      />
                      <label htmlFor="name" className="absolute left-0 -top-4 text-xs font-medium tracking-widest uppercase text-slate-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-600 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#ff71f9]">
                        Tên của bạn
                      </label>
                      <User size={18} strokeWidth={1.5} className="absolute right-0 bottom-4 text-white/10 peer-focus:text-[#ff71f9] transition-colors pointer-events-none" />
                    </div>

                    <div className="relative group">
                      <input 
                        type="email" 
                        required
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-transparent border-b border-white/20 text-white py-3 px-0 focus:outline-none focus:border-[#ff71f9] transition-colors peer placeholder-transparent"
                        placeholder="Email công việc"
                      />
                      <label htmlFor="email" className="absolute left-0 -top-4 text-xs font-medium tracking-widest uppercase text-slate-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-600 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#ff71f9]">
                        Email
                      </label>
                      <Mail size={18} strokeWidth={1.5} className="absolute right-0 bottom-4 text-white/10 peer-focus:text-[#ff71f9] transition-colors pointer-events-none" />
                    </div>

                    <div className="relative group">
                      <input 
                        type="tel" 
                        required
                        id="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 text-white py-3 px-0 focus:outline-none focus:border-[#ff71f9] transition-colors peer placeholder-transparent"
                        placeholder="Số điện thoại"
                      />
                      <label htmlFor="phone" className="absolute left-0 -top-4 text-xs font-medium tracking-widest uppercase text-slate-500 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-600 peer-placeholder-shown:top-3 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-[#ff71f9]">
                        Số điện thoại
                      </label>
                      <Phone size={18} strokeWidth={1.5} className="absolute right-0 bottom-4 text-white/10 peer-focus:text-[#ff71f9] transition-colors pointer-events-none" />
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#ff71f9] text-[#030e2a] font-medium tracking-[0.1em] uppercase text-sm overflow-hidden rounded-full hover:bg-white transition-colors duration-500 w-full md:w-auto disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="relative z-10 flex items-center">
                          {isSubmitting ? 'Đang gửi...' : 'Gửi cho tôi bộ tài liệu ngay'}
                          <ArrowRight strokeWidth={1.5} size={18} className="ml-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </button>
                      {submitError ? (
                        <p className="text-xs tracking-wide text-red-300 mt-4">{submitError}</p>
                      ) : null}
                      <p className="text-[10px] uppercase tracking-widest text-slate-600 mt-6">Cam kết bảo mật tuyệt đối thông tin cá nhân.</p>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="py-12 border border-white/10 p-10 text-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-[#ff71f9]"></div>
                   <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#ff71f9]">
                     <Check strokeWidth={1} size={32} />
                   </div>
                   <h3 className="text-2xl text-white mb-4 font-medium">Hoàn tất <span className="font-serif-accent italic text-[#ff71f9] font-normal">đăng ký</span></h3>
                   <p className="text-slate-400 font-light leading-relaxed">
                     Chúng tôi đã gửi link đọc tài liệu online tới <br/><span className="text-white">{formData.email}</span>
                   </p>
                   <p className="text-xs text-slate-600 mt-6 uppercase tracking-widest">Vui lòng kiểm tra hộp thư đến (hoặc spam).</p>
                </div>
              )}
            </Reveal>
          </div>

        </div>
      </section>

      <footer className="py-12 px-6 text-center z-10 relative border-t border-white/[0.02]">
        <span className="text-xs font-medium tracking-[0.2em] text-slate-600 uppercase">© {new Date().getFullYear()} Product Academy</span>
      </footer>

    </div>
  );
}
