import About from "../models/About.js";

export const getAboutContent = async (req, res) => {
  try {
    let content = await About.findOne();
    if (!content) {
      content = await About.create({
        yearsOfExcellence: 8,
        metrics: [
          { value: "1200+", label: "Happy Clients Accross Nations" },
          { value: "500+", label: "Unique Customized Outlines" },
          { value: "15+", label: "Expert Atelier Artisans" }
        ],
        values: [
          { icon: "🪡", title: "Craftsmanship", desc: "Every piece is handcrafted with meticulous, uncompromised attention to structural details." },
          { icon: "💛", title: "Authenticity", desc: "We deploy exclusively premium luxury threads alongside traditional, tested methods." },
          { icon: "🤝", title: "Partnership", desc: "We collaborate shoulder-to-shoulder with you to paint your artistic visual blueprints onto cloth." },
          { icon: "⭐", title: "Excellence", desc: "Our needles do not rest until your tailored expectations are perfectly fulfilled." }
        ]
      });
    }
    
    return res.status(200).json(content);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateAboutContent = async (req, res) => {
  try {
    let content = await About.findOne();
    if (!content) content = new About();

    Object.assign(content, req.body);
    await content.save();
    
    return res.status(200).json({ message: "Metrics and values updated successfully.", content });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};