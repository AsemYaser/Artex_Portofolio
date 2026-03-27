/* ============================================
   ARTEX DESIGNS — JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Dark Mode (Always On) ----------
  document.body.classList.add('dark-mode');
  localStorage.setItem('theme', 'dark');

  // ---------- Header Scroll Effect ----------
  const header = document.getElementById('header');
  const handleScroll = () => {
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // ---------- Mobile Menu ----------
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---------- Hero Animation ----------
  const hero = document.querySelector('.hero');
  if (hero) {
    setTimeout(() => hero.classList.add('loaded'), 100);
  }

  // ---------- Scroll Reveal Animations ----------
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ---------- Back to Top ----------
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- Counter Animation ----------
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-count'));
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(element, target) {
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      const suffix = element.textContent.includes('%') ? '%' : '+';
      element.textContent = Math.floor(current) + suffix;
    }, 25);
  }

  // ---------- Portfolio Filters ----------
  const filterButtons = document.querySelectorAll('.portfolio-filters button');
  const projectsGrid = document.querySelector('#projectsGrid');
  const projectCards = document.querySelectorAll('#projectsGrid .project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;

      // Update active button
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      if (projectsGrid) {
        // 1. Smoothly fade out the entire grid container
        projectsGrid.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        projectsGrid.style.opacity = '0';
        projectsGrid.style.transform = 'translateY(15px)';

        setTimeout(() => {
          // 2. Perform the filtering while invisible to prevent layout snap
          projectCards.forEach(card => {
            // Reset individual card styles from old logic
            card.style.transition = 'none';
            card.style.opacity = '1';
            card.style.transform = 'none';

            if (filter === 'all' || card.dataset.category === filter) {
              card.style.display = '';
            } else {
              card.style.display = 'none';
            }
          });

          // 3. Smoothly fade the grid back in after a tiny layout recalculation delay
          requestAnimationFrame(() => {
            projectsGrid.style.opacity = '1';
            projectsGrid.style.transform = 'translateY(0)';
          });
        }, 300); // Wait for fade out to complete
      }
    });
  });

  // ---------- Project Details Page ----------
  if (window.location.pathname.includes('project-details')) {
    loadProjectDetails();
  }

  // ---------- Before/After Slider ----------
  const beforeAfter = document.getElementById('beforeAfter');
  if (beforeAfter) {
    initBeforeAfter(beforeAfter);
  }
});

// ========== Project Data ==========
const projects = {
  'tropical-sanctuary': {
    title: 'Tropical Sanctuary | Modern Luxury House',
    category: 'Residential',
    style: 'Modern Luxury',
    year: '2026',
    client: 'Private Residence',
    heroImg: 'Projects/project_18/1.jpg',
    images: ['Projects/project_18/1.jpg', 'Projects/project_18/2.jpg', 'Projects/project_18/3.jpg', 'Projects/project_18/4.jpg', 'Projects/project_18/5.jpg', 'Projects/project_18/6.jpg', 'Projects/project_18/7.jpg', 'Projects/project_18/7 (2).jpg', 'Projects/project_18/8.jpg', 'Projects/project_18/9.jpg'],
    desc1: 'Redefining private luxury, this master bathroom is meticulously designed as a serene, spa-like sanctuary that prioritizes the human-nature connection. The interior employs a powerful biophilic aesthetic, featuring dramatic large-scale botanical graphics and expansive floor-to-ceiling glazing that frames lush exterior garden views.',
    desc2: 'A striking free-standing black-and-white tub serves as the room’s centerpiece, complemented by a sophisticated palette of large-format grey marble cladding and warm, slatted wood ceiling elements. Integrated LED lighting in recessed shelving, a framed double vanity with circular mirrors, and a black-enclosed walk-in shower ensure every detail is curated to offer a seamless fusion of modern functionality, tactile comfort, and deep relaxation.'
  },
  'modern-sanctuary': {
    title: 'The Modern Sanctuary | Biophilic Medical Clinic',
    category: 'Medical',
    style: 'Biophilic Modern',
    year: '2026',
    client: 'Private Medical Practice',
    heroImg: 'Projects/project_17/1.jpeg',
    images: ['Projects/project_17/1.jpeg', 'Projects/project_17/2.jpeg', 'Projects/project_17/3.jpeg', 'Projects/project_17/4.jpeg', 'Projects/project_17/5.jpeg', 'Projects/project_17/6.jpeg', 'Projects/project_17/7.jpeg', 'Projects/project_17/8.jpeg'],
    desc1: 'A contemporary medical masterpiece that harmonizes modern clinical requirements with vibrant botanical life. This open-concept clinic is defined by its dramatic connection to nature, featuring expansive floor-to-ceiling glazing that frames an intimate, integrated interior healing courtyard designed to reduce patient anxiety.',
    desc2: 'Lush vertical gardens serve as a living feature wall in the reception, providing a striking organic backdrop to the refined composition of natural wood textures, hygienic light marble flooring, and exposed black steel framing. The design prioritized patient flow and comfort, seamlessly connecting the relaxing waiting lounge area with the sleek, high-end treatment rooms, creating a sense of boundless tranquility. Architectural track lighting and warm ambient LEDs artfully illuminate the textural contrasts, ensuring a soothing and sophisticated retreat for optimal patient care.'
  },
  'architectural-purity': {
    title: 'Architectural Purity | Contemporary Elevation',
    category: 'Facade',
    style: 'Contemporary Minimalist',
    year: '2026',
    client: 'Private Client',
    heroImg: 'Projects/project_16/1.jpg',
    images: ['Projects/project_16/1.jpg', 'Projects/project_16/2.jpg', 'Projects/project_16/3.jpg', 'Projects/project_16/4.jpg', 'Projects/project_16/5.jpg', 'Projects/project_16/UniversalUpscaler_651bddf2-c229-4795-9dbe-c2c4563a9fde.jpg', 'Projects/project_16/UniversalUpscaler_65958623-28cd-47f9-85e4-ad6ff54d6aa6.jpg'],
    desc1: 'A striking architectural statement that embodies the principles of modern exterior design. This facade utilizes clean geometric lines and a sophisticated balance of solid volumes and expansive glazing to create a dynamic and commanding street presence.',
    desc2: 'The integration of textural contrasts—blending sleek, contemporary finishes with warm, natural architectural accents—adds remarkable depth and visual interest to the elevation. Thoughtfully positioned exterior lighting strategically accentuates the building\'s structural form, ensuring a compelling visual identity that seamlessly transitions from day to night, offering a masterclass in modern, functional elegance.'
  },
  'parisian-charm-2': {
    title: 'bla bla',
    category: 'Commercial',
    style: 'Classic European',
    year: '2026',
    client: 'High-End Salon',
    heroImg: 'Projects/project_15/2.jpg',
    images: ['Projects/project_15/1.jpg', 'Projects/project_15/2.jpg', 'Projects/project_15/3.jpg', 'Projects/project_15/4.jpg', 'Projects/project_15/5.jpg', 'Projects/project_15/6.jpg', 'Projects/project_15/Firefly_Gemini Flash_add people on chair as rea life day 346975.png'],
    desc1: 'A stunning masterclass in commercial exterior design, this facade exudes the timeless prestige of classic European architecture. Tailored for a high-end salon and boutique, the elevation features intricate stucco moldings, ornate pilasters, and graceful cornices, all finished in a refined, creamy monochrome palette.',
    desc2: 'The expansive, structural display windows maximize natural light and create a seamless visual connection between the street level and the curated interior collections. As day transitions to night, a sophisticated, warm architectural lighting scheme illuminates the facade\'s intricate details and elegant signage, transforming the building into a luminous, inviting beacon of luxury retail.'
  },
  'parisian-charm': {
    title: 'Parisian Charm | Classic Boutique & Salon Elevation',
    category: 'Facade',
    style: 'Classic European',
    year: '2026',
    client: 'High-End Salon',
    heroImg: 'Projects/project_14/2DL.jpg',
    images: ['Projects/project_14/1dl.jpg', 'Projects/project_14/1N.jpg', 'Projects/project_14/2DL.jpg', 'Projects/project_14/2N.jpg', 'Projects/project_14/3DL.jpg', 'Projects/project_14/3N.jpg'],
    desc1: 'A stunning masterclass in commercial exterior design, this facade exudes the timeless prestige of classic European architecture. Tailored for a high-end salon and boutique, the elevation features intricate stucco moldings, ornate pilasters, and graceful cornices, all finished in a refined, creamy monochrome palette.',
    desc2: 'The expansive, structural display windows maximize natural light and create a seamless visual connection between the street level and the curated interior collections. As day transitions to night, a sophisticated, warm architectural lighting scheme illuminates the facade\'s intricate details and elegant signage, transforming the building into a luminous, inviting beacon of luxury retail.'
  },
  'organic-opulence': {
    title: 'Organic Opulence | Contemporary Open-Plan Villa',
    category: 'Residential',
    style: 'Contemporary Luxury',
    year: '2026',
    client: 'Private Villa',
    heroImg: 'Projects/project_13/1.jpg',
    images: ['Projects/project_13/1.jpg', 'Projects/project_13/2.jpg', 'Projects/project_13/3.jpg', 'Projects/project_13/4.jpg', 'Projects/project_13/5.jpg', 'Projects/project_13/6.jpg', 'Projects/project_13/7.jpg', 'Projects/project_13/8.jpg', 'Projects/project_13/9.jpg', 'Projects/project_13/10.jpg', 'Projects/project_13/11.jpg'],
    desc1: 'This expansive residential project exemplifies contemporary luxury through a seamless open-plan design that balances architectural grandeur with inviting comfort. The interior is anchored by a stunning feature staircase, showcasing rich marble treads and a bespoke geometric brass railing, elegantly elevated above a beautifully integrated indoor garden that brings a refreshing biophilic touch to the core of the home.',
    desc2: 'The spatial flow effortlessly connects the living and dining areas, defined by a sophisticated and warm material palette. Plush, curvilinear seating softens the clean lines of the striking backlit accent walls and custom wood-slat media unit. A grand oval marble dining table, paired with olive-green velvet chairs, creates a refined focal point for entertaining. Through the meticulous pairing of natural wood textures, polished marble, and strategic ambient lighting, the design delivers a harmonious, high-end sanctuary tailored for elevated modern living.'
  },
  'transitional-master-suite': {
    title: 'Transitional Master Suite',
    category: 'Residential',
    style: 'Transitional',
    year: '2026',
    client: 'Private Residence',
    heroImg: 'Projects/project_12/1.jpg',
    images: ['Projects/project_12/1.jpg', 'Projects/project_12/2.jpg', 'Projects/project_12/3.jpg', 'Projects/project_12/4.jpg', 'Projects/project_12/5.jpg', 'Projects/project_12/6.jpg', 'Projects/project_12/7.jpg'],
    desc1: 'This luxurious master suite is a masterclass in transitional design, seamlessly blending contemporary clean lines with elegant neoclassical wall moldings. The interior is anchored by a rich, burgundy upholstered headboard and coordinating abstract artwork, providing a sophisticated, grounding pop of color against the warm, neutral palette.',
    desc2: 'Functional luxury is prioritized throughout the space, featuring a bespoke floating timber media console, a dedicated elegant vanity station, and a striking glass-enclosed walk-in wardrobe with integrated architectural lighting. A carefully layered lighting scheme—highlighted by a bold, sculptural circular chandelier and minimalist pendant drops—enhances the tactile fabrics and premium finishes, creating an intimate, highly curated sanctuary for rest and refined living.'
  },
  'illuminating-design': {
    title: 'Illuminating Design | High-End Lighting Showroom',
    category: 'Commercial',
    style: 'Modern Retail',
    year: '2026',
    client: 'Lighting Retailer',
    heroImg: 'Projects/project_11/111.jpg',
    images: ['Projects/project_11/111.jpg', 'Projects/project_11/222.jpg', 'Projects/project_11/333.jpg', 'Projects/project_11/3333.jpg', 'Projects/project_11/444.jpg', 'Projects/project_11/4440000.jpg'],
    desc1: 'A meticulously crafted retail environment designed to showcase high-end lighting fixtures and smart home technology. The showroom utilizes a sophisticated, moody aesthetic, pairing warm wood floors and slatted ceilings with deep charcoal display walls to create a dramatic backdrop that allows the products to take center stage.',
    desc2: 'The space is intelligently zoned, featuring a sleek, minimalist reception desk that anchors the entry, alongside curated displays of pendant lights, architectural floor lamps, and a comprehensive wall showcasing switches and control panels. A unique educational display visually demonstrates varying color temperatures, enhancing the customer experience. The design masterfully balances striking visual impact with highly functional product presentation, creating an immersive space for both design professionals and retail clients.'
  },
  'executive-authority': {
    title: 'Executive Authority | Modern Corporate Suite',
    category: 'Commercial',
    style: 'Corporate Modern',
    year: '2026',
    client: 'Corporate Client',
    heroImg: 'Projects/project_10/r1 (1).jpg',
    images: ['Projects/project_10/r1 (1).jpg', 'Projects/project_10/r1 (2).jpg', 'Projects/project_10/r1 (3).jpg', 'Projects/project_10/r1 (4).jpg', 'Projects/project_10/r2 (1).jpg', 'Projects/project_10/r2 (2).jpg', 'Projects/project_10/r2 (3).jpg', 'Projects/project_10/r2 (4).jpg'],
    desc1: 'Designed to project authority and refined professionalism, this modern corporate office suite balances executive presence with contemporary aesthetics. The space features a commanding manager\'s office anchored by a streamlined desk, sleek black leather seating, and sophisticated back-lit shelving framing striking abstract artwork.',
    desc2: 'A dedicated meeting room utilizes frosted glass partitions, striking track lighting, and bold wall typography to create a focused, collaborative environment with a degree of privacy. The transition spaces are equally considered, highlighted by a stylish, wood-paneled coffee point with custom neon signage. The integration of warm wood tones, tailored carpeting, and minimalist architectural details results in a cohesive workspace that exudes confidence, focus, and modern corporate identity.'
  },
  'whimsical-symmetry': {
    title: 'Whimsical Symmetry | Contemporary Shared Bedroom',
    category: 'Residential',
    style: 'Contemporary Minimalist',
    year: '2026',
    client: 'Private Client',
    heroImg: 'Projects/project_9/1.jpg',
    images: ['Projects/project_9/1.jpg', 'Projects/project_9/2.jpg', 'Projects/project_9/3.jpg', 'Projects/project_9/4.jpg', 'Projects/project_9/5.jpg', 'Projects/project_9/6.jpg', 'Projects/project_9/7.jpg', 'Projects/project_9/8.jpg', 'Projects/project_9/9.jpg'],
    desc1: 'Striking a delicate balance between youthful charm and refined elegance, this contemporary shared bedroom is designed as a soothing retreat that evolves with its occupants. The interior is anchored by a harmonious symmetrical layout, featuring plush upholstered twin beds set against bespoke architectural wall paneling with integrated warm LED lighting.',
    desc2: 'A calming palette of earthy neutrals, warm wood tones, and soft sage green is playfully contrasted by an abstract patterned frieze, adding visual intrigue without overwhelming the space. Custom floor-to-ceiling wooden joinery offers highly functional, illuminated storage, while minimalist black pendant fixtures and tactile, textured artwork complete the sophisticated composition. The result is a meticulously crafted haven that seamlessly blends comfort, practical storage, and playful modernity.'
  },
  'serene-smiles': {
    title: 'Serene Smiles | Contemporary Dental Studio',
    category: 'Medical',
    style: 'Hospitality Design',
    year: '2026',
    client: 'Dental Clinic',
    heroImg: 'Projects/project_8/Artboard 1.png',
    images: ['Projects/project_8/Artboard 1.png', 'Projects/project_8/Artboard 1 copy.png', 'Projects/project_8/Artboard 1 copy 2.png', 'Projects/project_8/Artboard 1 copy 3.png', 'Projects/project_8/Artboard 1 copy 4.png', 'Projects/project_8/Artboard 1 copy 5.png', 'Projects/project_8/Artboard 1 copy 6.png', 'Projects/project_8/Artboard 1 copy 7.png'],
    desc1: 'Redefining the traditional healthcare environment, this dental clinic is designed to alleviate patient anxiety through a calming, hospitality-inspired aesthetic. The interior employs a soothing palette of warm neutrals, soft greens, and natural wood finishes, beautifully grounded by elegant marble-veined flooring.',
    desc2: 'Curvilinear forms—highlighted in the bespoke ribbed reception desk and plush waiting area seating—soften the clinical atmosphere, while contemporary lighting fixtures add a touch of modern sophistication. Inside the treatment rooms, striking educational wall graphics are seamlessly integrated into the textured walls, creating a space that is not only highly functional and ergonomic for practitioners but also deeply comforting and engaging for patients.'
  },
  'structured-elegance': {
    title: 'Contemporary Villa Elevation',
    category: 'Facade',
    style: 'Contemporary Architecture',
    year: '2026',
    client: 'Private Villa',
    heroImg: 'Projects/project_7/1.jpg',
    images: ['Projects/project_7/1.jpg', 'Projects/project_7/2.jpg', 'Projects/project_7/3.jpg', 'Projects/project_7/4.jpg', 'Projects/project_7/6.jpg', 'Projects/project_7/7 day.jpg', 'Projects/project_7/7 night.jpg'],
    desc1: 'A striking masterclass in contemporary architecture, this residential facade utilizes bold geometric volumes to establish a commanding yet sophisticated street presence. The design expertly balances a warm, textured neutral palette with stark charcoal architectural framing, creating a dynamic sense of depth and visual rhythm.',
    desc2: 'Expansive floor-to-ceiling windows and minimalist linear balconies, complemented by integrated planters, seamlessly connect the interior spaces with the outdoors. As day turns to night, a meticulously concealed LED lighting scheme highlights the building\'s structural contours, transforming the residence into a modern beacon of upscale urban living.'
  },
  'timeless-grandeur': {
    title: 'Timeless Grandeur | Neoclassical Villa Exterior',
    category: 'Facade',
    style: 'Neoclassical Architecture',
    year: '2026',
    client: 'Private Residence',
    heroImg: 'Projects/project_6/2.jpg',
    images: ['Projects/project_6/2.jpg', 'Projects/project_6/3.jpg', 'Projects/project_6/4.jpg', 'Projects/project_6/5.jpg'],
    desc1: 'A masterwork of timeless elegance, this exterior facade draws inspiration from classical architectural principles to establish a commanding yet graceful residential presence. The design is governed by strict symmetry and harmonious proportions, featuring towering fluted columns, intricate bas-relief medallions, and elegant arched fenestrations that draw the eye upward.',
    desc2: 'The sweeping, multi-level balustraded balconies offer a refined transition between the indoor and outdoor spaces, while the warm, textured stone finish exudes sophisticated luxury. Complemented by classic ambient wall sconces and a meticulously detailed boundary wall with wrought-iron accents, this elevation is crafted to make an enduring statement of grand, prestigious living.'
  },
  'serene-sanctuary': {
    title: 'Serene Sanctuary | Warm Minimalist Master Suite',
    category: 'Residential',
    style: 'Warm Minimalism',
    year: '2026',
    client: 'Private Suite',
    heroImg: 'Projects/project_5/2.jpg',
    images: ['Projects/project_5/2.jpg', 'Projects/project_5/3.jpg', 'Projects/project_5/4.jpg', 'Projects/project_5/5.jpg', 'Projects/project_5/9.jpg'],
    desc1: 'This master bedroom suite exemplifies the elegant balance of warm minimalism, designed as a tranquil retreat from the outside world. The architectural language is defined by a soft, earthy color palette, elevated by natural wood finishes and custom fluted paneling that adds rhythmic depth to the walls.',
    desc2: 'A seamless integration of functionality and luxury is evident throughout the space—from the bespoke floating media console and illuminated glass display vitrine to the meticulously crafted walk-in closet, dramatically framed by striking linear LED lighting. Layered ambient lighting, combined with expansive floor-to-ceiling windows, creates a light-filled, airy atmosphere that highlights the plush textiles and refined finishes, offering the ultimate sanctuary for rest and sophisticated living.'
  },
  'corporate-clarity': {
    title: 'Corporate Clarity | Minimalist Executive Boardroom',
    category: 'Commercial',
    style: 'Corporate Minimalism',
    year: '2026',
    client: 'Corporate Head Office',
    heroImg: 'Projects/project_4/111.jpg',
    images: ['Projects/project_4/111.jpg', 'Projects/project_4/22.jpg', 'Projects/project_4/444.jpg', 'Projects/project_4/5.jpg', 'Projects/project_4/7885.jpg'],
    desc1: 'A refined approach to corporate interior design, this executive meeting space is meticulously crafted to foster focus, collaboration, and professional elegance. The interior utilizes a sophisticated neutral palette, anchored by seamless wood veneer paneling and tailored textured carpeting designed to enhance acoustic comfort in a corporate setting.',
    desc2: 'Striking black accents—from the ergonomic leather seating and minimalist pendant fixtures to the directional track lighting—provide a sharp, contemporary contrast against the warm architectural tones. By integrating soft cove lighting, strategic indoor greenery, and statement artwork such as the large-scale urban map, the design elevates the traditional boardroom into an inspiring, modern workspace that exudes quiet authority and sophisticated functionality.'
  },
  'interlocking-comfort': {
    title: 'Modern Twin Bedroom',
    category: 'Residential',
    style: 'Modern Twin Bedroom',
    year: '2026',
    client: 'Private Client',
    heroImg: 'Projects/project_3/f1pp.jpg',
    images: [
      'Projects/project_3/f1pp.jpg',
      'Projects/project_3/f2pp.jpg',
      'Projects/project_3/f3pp.jpg',
      'Projects/project_3/f4pp.jpg',
      'Projects/project_3/f5pp.jpg'
    ],
    desc1: 'A modern interpretation of a shared bedroom, designed to balance harmony and individual expression. The space is anchored by a sculptural feature wall of interlocking puzzle-piece acoustic panels, adding both visual depth and sound control. A palette of muted cream, mauve, and deep charcoal creates a serene and sophisticated haven.',
    desc2: 'Symmetrical twin beds with velvet upholstery are paired with integrated cabinetry, providing an abundance of curated storage solutions. From the ribbed texture of the desk to the playful neon signage and contemporary art, every element is meticulously detailed to offer a seamless fusion of comfort, modern aesthetics, and sensory experience.'
  },
  'sculpted-serenity': {
    title: 'Contemporary Luxe Living',
    category: 'Residential',
    style: 'Contemporary Luxe Living',
    year: '2026',
    client: 'Private Residence',
    heroImg: 'Projects/project_2/2.jpg',
    images: [
      'Projects/project_2/2.jpg',
      'Projects/project_2/Corona_Camera002_0000.jpg',
      'Projects/project_2/Corona_Camera003_0000.jpg',
      'Projects/project_2/Corona_Camera004_0000.jpg',
      'Projects/project_2/Corona_Camera005_0000.jpg',
      'Projects/project_2/Corona_Camera006_0000.jpg',
      'Projects/project_2/Corona_Camera007_0000.jpg',
      'Projects/project_2/Corona_Camera008_0000.jpg',
      'Projects/project_2/Corona_Camera009_0000.jpg'
    ],
    desc1: 'A masterclass in contemporary residential design, this interior is curated as a sophisticated sanctuary of curated relaxation. By marrying architectural fluted wood paneling with polished marble surfaces and a dramatic black marble feature wall, we created a luxurious yet inviting atmosphere.',
    desc2: 'The spatial flow is defined by curvilinear forms, from the elegant sectionals to the rounded velvet armchairs, softening the geometry and enhancing tactile comfort. Bespoke linear chandeliers and integrated LED accents provide a layered, photogenic light experience, ensuring the home is not just a residence, but a sensory-driven retreat of gilded tranquility.'
  },
  'organic-oasis': {
    title: 'The Organic Oasis | Biophilic Juice Lounge',
    category: 'Commercial',
    style: 'Biophilic Modern',
    year: '2026',
    client: 'The Organic Oasis',
    heroImg: 'Projects/project_1/1.jpg',
    images: [
      'Projects/project_1/1.jpg',
      'Projects/project_1/3.jpg',
      'Projects/project_1/4.jpg',
      'Projects/project_1/5.jpg',
      'Projects/project_1/6.jpg',
      'Projects/project_1/7.jpg',
      'Projects/project_1/8.jpg',
      'Projects/project_1/9.jpg',
      'Projects/project_1/10.jpg'
    ],
    desc1: 'A contemporary biophilic concept that redefines the modern juice and dessert bar experience. By blending a warm terracotta and lush sage green palette with natural fluted wood textures, we created an organic oasis that feels fresh and inviting.',
    desc2: 'The design strategically employs integrated neon signage and soft ambient lighting to craft distinct, photogenic moments for customers. From the elegant terrazzo surfaces to the signature curved alcove seating, every detail is meticulously curated to offer a seamless fusion of comfort, modern aesthetics, and sensory delight.'
  },
  'modern-apartment': {
    title: 'Modern Apartment',
    category: 'Residential',
    style: 'Contemporary Modern',
    year: '2025',
    client: 'Al-Rashid Family',
    heroImg: 'images/project-apartment.png',
    images: ['images/project-apartment.png', 'images/project-kitchen.png', 'images/project-bedroom.png'],
    beforeImg: 'images/project-office.png',
    afterImg: 'images/project-apartment.png',
    desc1: 'This stunning modern apartment was designed for a young professional couple who wanted a space that felt both sophisticated and welcoming. The open-plan living area features floor-to-ceiling windows that flood the space with natural light.',
    desc2: 'We selected a warm neutral palette with carefully placed accent pieces that add depth and personality. Custom furniture was designed to maximize the space while maintaining clean, contemporary lines throughout.'
  },
  'luxury-villa': {
    title: 'Luxury Villa',
    category: 'Residential',
    style: 'Modern Luxury',
    year: '2024',
    client: 'Private Investor',
    heroImg: 'images/project-villa.png',
    images: ['images/project-villa.png', 'images/project-bathroom.png', 'images/hero.png'],
    beforeImg: 'images/project-commercial.png',
    afterImg: 'images/project-villa.png',
    desc1: 'This luxury villa project showcases our ability to create grand yet intimate spaces. The double-height main living area serves as the heart of the home, with a sweeping staircase that creates a dramatic architectural statement.',
    desc2: 'Premium materials including Italian marble, hand-selected hardwoods, and custom metalwork create layers of texture and sophistication throughout the space. The design seamlessly integrates indoor and outdoor living.'
  },
  'executive-office': {
    title: 'Executive Office',
    category: 'Commercial',
    style: 'Corporate Modern',
    year: '2025',
    client: 'Global Tech Corp',
    heroImg: 'images/project-office.png',
    images: ['images/project-office.png', 'images/project-apartment.png', 'images/project-kitchen.png'],
    beforeImg: 'images/project-bedroom.png',
    afterImg: 'images/project-office.png',
    desc1: 'Designed for a leading technology company, this executive office space balances professional authority with creative energy. The boardroom features a custom conference table and state-of-the-art technology integration.',
    desc2: 'Glass partitions maintain an open, collaborative atmosphere while providing necessary privacy. The material palette of dark wood, leather, and brushed metal creates a sophisticated corporate environment.'
  },
  'fine-dining': {
    title: 'Fine Dining Restaurant',
    category: 'Commercial',
    style: 'Classic Luxury',
    year: '2024',
    client: 'Maison Dorée Group',
    heroImg: 'images/project-commercial.png',
    images: ['images/project-commercial.png', 'images/project-villa.png', 'images/project-bathroom.png'],
    beforeImg: 'images/project-apartment.png',
    afterImg: 'images/project-commercial.png',
    desc1: 'This upscale restaurant demanded an interior that would rival the quality of its cuisine. Plush velvet seating, dramatic lighting installations, and a stunning marble bar create an unforgettable dining atmosphere.',
    desc2: 'Every detail was considered, from the custom table settings to the acoustic treatment ensuring intimate conversation. The warm color palette creates an inviting ambiance that keeps guests returning.'
  },
  'master-bedroom': {
    title: 'Master Bedroom Suite',
    category: 'Residential',
    style: 'Modern Minimalist',
    year: '2025',
    client: 'Hassan Residence',
    heroImg: 'images/project-bedroom.png',
    images: ['images/project-bedroom.png', 'images/project-bathroom.png', 'images/project-apartment.png'],
    beforeImg: 'images/project-kitchen.png',
    afterImg: 'images/project-bedroom.png',
    desc1: 'This master bedroom suite was designed as a personal sanctuary. Soft, muted tones and natural materials create a calming retreat from the demands of daily life. The custom headboard wall serves as a sculptural focal point.',
    desc2: 'Integrated lighting allows the mood to shift from energizing morning light to warm evening ambiance. A connected walk-in closet and spa-like en-suite bathroom complete the luxury suite experience.'
  },
  'spa-bathroom': {
    title: 'Spa-Inspired Bathroom',
    category: 'Residential',
    style: 'Contemporary Spa',
    year: '2024',
    client: 'Private Client',
    heroImg: 'images/project-bathroom.png',
    images: ['images/project-bathroom.png', 'images/project-bedroom.png', 'images/project-villa.png'],
    beforeImg: 'images/project-office.png',
    afterImg: 'images/project-bathroom.png',
    desc1: 'This spa-inspired bathroom transforms daily routines into luxurious rituals. A freestanding soaking tub sits beneath a skylight, while floor-to-ceiling marble creates a sense of timeless grandeur.',
    desc2: 'Rain shower fixtures, heated floors, and carefully placed greenery complete the spa experience. Gold accents add warmth against the cool marble palette, creating a perfect balance of opulence and serenity.'
  },
  'modern-kitchen': {
    title: 'Designer Kitchen',
    category: 'Residential',
    style: 'Modern Contemporary',
    year: '2025',
    client: 'Al-Fahad Family',
    heroImg: 'images/project-kitchen.png',
    images: ['images/project-kitchen.png', 'images/project-apartment.png', 'images/project-villa.png'],
    beforeImg: 'images/project-bedroom.png',
    afterImg: 'images/project-kitchen.png',
    desc1: 'This designer kitchen is the centerpiece of a luxury apartment renovation. White marble countertops and backsplash create a pristine canvas, while gold hardware adds subtle warmth and sophistication.',
    desc2: 'High-end integrated appliances maintain the clean aesthetic, and a generous island provides both workspace and casual dining. Pendant lighting above the island creates a warm focal point for evening entertaining.'
  },
  'luxury-living': {
    title: 'Luxury Living Room',
    category: 'Residential',
    style: 'Grand Modern',
    year: '2024',
    client: 'Elite Properties',
    heroImg: 'images/hero.png',
    images: ['images/hero.png', 'images/project-villa.png', 'images/project-commercial.png'],
    beforeImg: 'images/project-office.png',
    afterImg: 'images/hero.png',
    desc1: 'This grand living room embodies the pinnacle of luxury interior design. Floor-to-ceiling windows frame breathtaking views, while marble floors reflect natural light throughout the expansive space.',
    desc2: 'Custom furniture groupings create intimate conversation areas within the generous proportions. The neutral palette is elevated by carefully curated art pieces and golden accent lighting that adds warmth and drama.'
  }
};

// ========== Load Project Details ==========
function loadProjectDetails() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('project') || 'modern-apartment';
  const project = projects[projectId] || projects['modern-apartment'];

  // Update page
  document.title = `${project.title} — Artex Designs`;
  document.getElementById('projectTitle').textContent = project.title;
  document.getElementById('projectBreadcrumb').textContent = project.title;
  document.getElementById('projectHero').style.backgroundImage = `url('${project.heroImg}')`;
  document.getElementById('projectHeading').textContent = project.title;
  document.getElementById('projectDesc1').textContent = project.desc1;
  document.getElementById('projectDesc2').textContent = project.desc2;
  // Build stacked gallery
  const stackedGallery = document.getElementById('stackedGallery');

  // ensure there are at least 4 images to show stacked depths by repeating if necessary
  let galleryImgs = [...project.images];
  while (galleryImgs.length > 0 && galleryImgs.length < 4) {
    galleryImgs = [...galleryImgs, ...project.images];
  }

  if (stackedGallery && galleryImgs.length > 0) {
    stackedGallery.innerHTML = '';
    galleryImgs.forEach((img, i) => {
      const slide = document.createElement('div');
      slide.className = 'stacked-slide';
      slide.innerHTML = `<img src="${img}" alt="${project.title} - Image ${i + 1}">`;
      stackedGallery.appendChild(slide);
    });

    // Add logic state to window so slider can use it globally
    window.stackedImagesCount = galleryImgs.length;
    window.currentStackedSlide = 0;
    updateStackedSlider();
  }
}

function stackedSlide(direction) {
  const total = window.stackedImagesCount;
  if (!total) return;
  window.currentStackedSlide = (window.currentStackedSlide + direction + total) % total;
  updateStackedSlider();
}

function updateStackedSlider() {
  const gallery = document.getElementById('stackedGallery');
  if (!gallery) return;
  const slides = gallery.querySelectorAll('.stacked-slide');
  const total = slides.length;
  const current = window.currentStackedSlide;

  requestAnimationFrame(() => {
    slides.forEach((slide, i) => {
      slide.className = 'stacked-slide'; // reset
      // calculate offset relative to current, wrapping around
      let offset = i - current;
      if (offset < 0) offset += total;

      if (offset < 4) {
        slide.classList.add(`stack-${offset}`);
        slide.style.opacity = '';
      } else {
        // hidden slides behind the stack
        slide.classList.add('stack-3');
        slide.style.opacity = '0';
      }
    });
  });
}

// ========== Before/After Slider ==========
function initBeforeAfter(container) {
  const handle = container.querySelector('.slider-handle');
  const afterImg = container.querySelector('.after-img');
  let isDragging = false;

  function updatePosition(x) {
    const rect = container.getBoundingClientRect();
    let pos = (x - rect.left) / rect.width;
    pos = Math.max(0.05, Math.min(0.95, pos));
    afterImg.style.width = `${pos * 100}%`;
    handle.style.left = `${pos * 100}%`;
  }

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePosition(e.clientX);
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) updatePosition(e.clientX);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch support
  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    updatePosition(e.touches[0].clientX);
  });

  container.addEventListener('touchmove', (e) => {
    if (isDragging) {
      e.preventDefault();
      updatePosition(e.touches[0].clientX);
    }
  });

  container.addEventListener('touchend', () => {
    isDragging = false;
  });
}

// ========== EmailJS Contact Form ==========
(function(){
  if (typeof emailjs !== 'undefined') {
    emailjs.init("Y34sRSIRx2hHdGBgv");
  }
})();



// ========== Smooth scroll for anchor links ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---------- Contact Form Validation ----------
function initContactForm() {
  var form = document.getElementById('contact-form');
  var sendBtn = document.getElementById('send-btn');
  if (!form || !sendBtn) return;

  // Initialize EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init('Y34sRSIRx2hHdGBgv');
  }

  // Block any native form submission entirely
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  // Initialize intl-tel-input for the phone field
  var phoneField = document.getElementById('phone');
  var iti = null;
  if (phoneField && typeof window.intlTelInput !== 'undefined') {
    iti = window.intlTelInput(phoneField, {
      initialCountry: "eg",
      preferredCountries: ["eg", "sa", "ae", "kw", "qa"],
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js"
    });
  }

  var validators = {
    name: {
      test: function(v) { return /^[A-Za-z\s\u0600-\u06FF]{2,}$/.test(v.trim()); },
      msg: 'Please enter a valid name (letters only, at least 2 characters)'
    },
    phone: {
      test: function(v) { 
        if (iti) return iti.isValidNumber();
        return /^[\+]?[0-9\s]{7,15}$/.test(v.trim()); 
      },
      msg: 'Please enter a valid phone number for your country'
    },
    email: {
      test: function(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      msg: 'Please enter a valid email address'
    },
    message: {
      test: function(v) { return v.trim().length >= 10; },
      msg: 'Please enter at least 10 characters'
    }
  };

  var fieldIds = ['name', 'phone', 'email', 'message'];

  function showError(fieldId, msg) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    if (field) field.classList.add('field-invalid');
    if (errorEl) errorEl.textContent = msg;
  }

  function clearError(fieldId) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    if (field) field.classList.remove('field-invalid');
    if (errorEl) errorEl.textContent = '';
  }

  // Clear errors on input
  fieldIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function() { clearError(id); });
    }
  });

  // Restrict phone to digits, spaces, and +
  var phoneField = document.getElementById('phone');
  if (phoneField) {
    phoneField.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/[^0-9+\s]/g, '');
    });
  }

  // SEND button click — validate FIRST, send ONLY if valid
  sendBtn.addEventListener('click', function() {
    var isValid = true;
    var firstInvalid = null;

    for (var i = 0; i < fieldIds.length; i++) {
      var id = fieldIds[i];
      var rule = validators[id];
      var field = document.getElementById(id);
      if (!field) continue;

      if (!rule.test(field.value)) {
        showError(id, rule.msg);
        if (!firstInvalid) firstInvalid = field;
        isValid = false;
      } else {
        clearError(id);
      }
    }

    // STOP if any field is invalid
    if (!isValid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // ALL fields valid — now send
    if (typeof emailjs !== 'undefined') {
      sendBtn.textContent = 'Sending...';
      sendBtn.disabled = true;

      // Extract the full international number before sending
      if (iti) {
        phoneField.value = iti.getNumber();
      }

      emailjs.sendForm('service_gwypcmm', 'template_zwzs3x3', form)
        .then(function() {
          sendBtn.textContent = '✓ Message Sent!';
          sendBtn.style.background = '#25D366';
          sendBtn.style.borderColor = '#25D366';
          sendBtn.style.color = '#fff';

          setTimeout(function() {
            sendBtn.textContent = 'Send Message';
            sendBtn.style.background = '';
            sendBtn.style.borderColor = '';
            sendBtn.style.color = '';
            sendBtn.disabled = false;
            form.reset();
          }, 3000);
        })
        .catch(function() {
          sendBtn.textContent = 'Error! Try Again';
          sendBtn.style.background = '#ff4d4d';
          sendBtn.style.borderColor = '#ff4d4d';
          sendBtn.style.color = '#fff';

          setTimeout(function() {
            sendBtn.textContent = 'Send Message';
            sendBtn.style.background = '';
            sendBtn.style.borderColor = '';
            sendBtn.style.color = '';
            sendBtn.disabled = false;
          }, 3000);
        });
    } else {
      alert('Form service is not configured. Please contact us directly.');
    }
  });
}

// Run when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactForm);
} else {
  initContactForm();
}

// ========== Fullscreen Lightbox ==========
(function() {
  // Wait for DOM and project to load
  const initLightbox = () => {
    const overlay = document.getElementById('lightboxOverlay');
    const wrapper = document.getElementById('lightboxWrapper');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const counter = document.getElementById('lightboxCounter');

    if (!overlay || !wrapper) return;

    let currentImages = [];
    let currentIndex = 0;
    
    // Use exactly 2 nodes for crossfading to save massive GPU memory
    let slideA = document.createElement('img');
    let slideB = document.createElement('img');
    wrapper.appendChild(slideA);
    wrapper.appendChild(slideB);
    
    let activeSlide = slideA;
    let inactiveSlide = slideB;

    function preloadImage(url) {
      if (!url) return;
      const img = new Image();
      img.src = url;
    }

    function openLightbox(images, index) {
      currentImages = images;
      currentIndex = index;
      
      activeSlide.src = images[currentIndex];
      activeSlide.classList.add('active');
      inactiveSlide.classList.remove('active');

      counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      if (images.length > 1) {
        preloadImage(images[(currentIndex + 1) % images.length]);
        preloadImage(images[(currentIndex - 1 + images.length) % images.length]);
      }
    }

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => { 
        activeSlide.src = ''; 
        inactiveSlide.src = '';
        activeSlide.classList.remove('active');
      }, 400); 
    }

    function navigate(direction) {
      if (currentImages.length === 0) return;
      
      currentIndex = (currentIndex + direction + currentImages.length) % currentImages.length;
      
      // Setup the hidden slide with new image before fading in
      inactiveSlide.src = currentImages[currentIndex];
      
      // Triggers immediate CSS crossfade 
      inactiveSlide.classList.add('active');
      activeSlide.classList.remove('active');
      
      // Swap references
      const temp = activeSlide;
      activeSlide = inactiveSlide;
      inactiveSlide = temp;
      
      counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
      preloadImage(currentImages[(currentIndex + direction + currentImages.length) % currentImages.length]);
    }

    // Close handlers
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('lightbox-image-wrapper')) {
        closeLightbox();
      }
    });

    // Navigation handlers
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });

    // Attach click handlers to stacked gallery slides
    const attachGalleryClicks = () => {
      const gallery = document.getElementById('stackedGallery');
      if (!gallery) return;

      // Get the project images from the data
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get('project') || 'modern-apartment';
      const project = projects[projectId] || projects['modern-apartment'];
      if (!project) return;

      const projectImages = project.images;

      gallery.addEventListener('click', (e) => {
        const slide = e.target.closest('.stacked-slide');
        if (!slide || !slide.classList.contains('stack-0')) return;

        // Find which project image index corresponds to this slide
        const slideIndex = window.currentStackedSlide || 0;
        const imgIndex = slideIndex % projectImages.length;
        openLightbox(projectImages, imgIndex);
      });
    };

    // Delay to ensure project details are loaded first
    if (window.location.pathname.includes('project-details')) {
      setTimeout(attachGalleryClicks, 300);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }
})();
